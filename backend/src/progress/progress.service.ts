import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorkoutLogEntity } from '../entities/workout-log.entity';
import { ProgressStatsDto, WeeklyVolumeDto } from './dto/progress-stats.dto';
import { subWeeks, startOfWeek, format } from 'date-fns';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(WorkoutLogEntity)
    private readonly workoutLogRepository: Repository<WorkoutLogEntity>,
  ) {}

  async getStats(userId: string): Promise<ProgressStatsDto> {
    const weeklyVolume = await this.getWeeklyVolume(userId);
    const consistencyScore = await this.getConsistencyScore(userId);
    const workoutStreak = await this.getWorkoutStreak(userId);
    const recentPRs = await this.getRecentPRs(userId);

    return {
      weeklyVolume,
      consistencyScore,
      recentPRs,
      workoutStreak,
    };
  }

  private async getRecentPRs(userId: string): Promise<string[]> {
    const thirtyDaysAgo = subWeeks(new Date(), 4);

    const allLogs = await this.workoutLogRepository.find({
      where: { userId },
      relations: ['exercises', 'exercises.sets', 'exercises.exercise'],
      order: { date: 'ASC' },
    });

    const exerciseMaxWeight = new Map<string, number>();
    const prs: string[] = [];

    for (const log of allLogs) {
      const isRecent = log.date >= thirtyDaysAgo;

      for (const ex of log.exercises) {
        let sessionMax = 0;
        for (const set of ex.sets) {
          if (set.completed && set.weight) {
            if (set.weight > sessionMax) sessionMax = set.weight;
          }
        }

        if (sessionMax > 0) {
          const currentMax = exerciseMaxWeight.get(ex.exerciseId) || 0;
          if (sessionMax > currentMax) {
            if (isRecent && currentMax > 0) {
              const exerciseName = ex.exercise?.name || 'Unknown Exercise';
              prs.push(`${exerciseName}: ${sessionMax}kg`);
            }
            exerciseMaxWeight.set(ex.exerciseId, sessionMax);
          }
        }
      }
    }

    return prs.reverse().slice(0, 5);
  }

  private async getWeeklyVolume(userId: string): Promise<WeeklyVolumeDto[]> {
    const weeksToAnalyze = 12;
    const endDate = new Date();
    const startDate = subWeeks(endDate, weeksToAnalyze);

    const logs = await this.workoutLogRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      relations: ['exercises', 'exercises.sets'],
      order: { date: 'ASC' },
    });

    // Group by week
    const volumeByWeek = new Map<
      string,
      { volume: number; count: number; totalReps: number }
    >();

    // Initialize weeks
    for (let i = 0; i < weeksToAnalyze; i++) {
      const weekStart = startOfWeek(subWeeks(endDate, i), { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      volumeByWeek.set(weekKey, { volume: 0, count: 0, totalReps: 0 });
    }

    logs.forEach((log) => {
      const weekStart = startOfWeek(log.date, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');

      if (!volumeByWeek.has(weekKey)) {
        // Should be initialized, but just in case
        volumeByWeek.set(weekKey, { volume: 0, count: 0, totalReps: 0 });
      }

      const weekData = volumeByWeek.get(weekKey)!;
      weekData.count += 1;

      // Calculate volume for this workout
      let workoutVolume = 0;
      let workoutReps = 0;
      log.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (set.completed && set.weight && set.reps) {
            workoutVolume += set.weight * set.reps;
            workoutReps += set.reps;
          }
        });
      });

      weekData.volume += workoutVolume;
      weekData.totalReps += workoutReps;
    });

    const result: WeeklyVolumeDto[] = [];
    volumeByWeek.forEach((data, date) => {
      result.push({
        weekStart: date,
        volume: data.volume,
        workoutCount: data.count,
        avgIntensity: data.totalReps > 0 ? Math.round(data.volume / data.totalReps) : 0,
      });
    });

    return result.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  }

  private async getConsistencyScore(userId: string): Promise<number> {
    // Simple consistency: % of weeks in last 3 months with at least 1 workout
    // A better metric would compare against a planned schedule
    const weeksToAnalyze = 12;
    const endDate = new Date();
    const startDate = subWeeks(endDate, weeksToAnalyze);

    const logs = await this.workoutLogRepository.find({
      where: { userId, date: Between(startDate, endDate) },
      select: ['date'],
    });

    const activeWeeks = new Set<string>();
    logs.forEach((log) => {
      const weekKey = format(startOfWeek(log.date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      activeWeeks.add(weekKey);
    });

    return Math.round((activeWeeks.size / weeksToAnalyze) * 100);
  }

  private async getWorkoutStreak(userId: string): Promise<number> {
    // Calculate current streak in weeks
    // Logic: check backwards from current week
    const logs = await this.workoutLogRepository.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 100,
    });

    if (logs.length === 0) return 0;

    const activeWeeks = new Set<string>();
    logs.forEach((log) => {
      activeWeeks.add(format(startOfWeek(log.date, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    });

    let streak = 0;
    let currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });

    // Check if user worked out this week
    if (activeWeeks.has(format(currentWeek, 'yyyy-MM-dd'))) {
      streak++;
    } else {
      // If no workout this week, check last week. If neither, streak is 0.
      // Unless we treat "current week" as not yet broken?
      // Let's say streak continues if they worked out last week.
    }

    // Check backwards
    while (true) {
      currentWeek = subWeeks(currentWeek, 1);
      if (activeWeeks.has(format(currentWeek, 'yyyy-MM-dd'))) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
