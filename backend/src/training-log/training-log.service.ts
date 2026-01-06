import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutLogEntity } from '../entities/workout-log.entity';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { UpdateWorkoutLogDto } from './dto/update-workout-log.dto';

export type WorkoutLogWithVolume = WorkoutLogEntity & { totalVolume: number };

@Injectable()
export class TrainingLogService {
  constructor(
    @InjectRepository(WorkoutLogEntity)
    private readonly logRepository: Repository<WorkoutLogEntity>,
  ) {}

  private calculateVolume(log: WorkoutLogEntity): number {
    let volume = 0;
    if (log.exercises) {
      for (const exercise of log.exercises) {
        if (exercise.sets) {
          for (const set of exercise.sets) {
            if (set.completed && set.weight !== null && set.reps !== null) {
              volume += Number(set.weight) * Number(set.reps);
            }
          }
        }
      }
    }
    return volume;
  }

  private withVolume(log: WorkoutLogEntity): WorkoutLogWithVolume {
    return {
      ...log,
      totalVolume: this.calculateVolume(log),
    };
  }

  async create(userId: string, dto: CreateWorkoutLogDto): Promise<WorkoutLogWithVolume> {
    const log = this.logRepository.create({
      ...dto,
      userId,
    });
    const savedLog = await this.logRepository.save(log);
    // Reload to ensure we have all fields and consistent structure if needed,
    // but save should return the structure.
    // However, for consistency and to avoid partial object issues, let's return the transformed savedLog.
    return this.withVolume(savedLog);
  }

  async findAll(userId: string): Promise<WorkoutLogWithVolume[]> {
    const logs = await this.logRepository.find({
      where: { userId },
      relations: ['exercises', 'exercises.sets', 'exercises.exercise'],
      order: { date: 'DESC' },
    });
    return logs.map((log) => this.withVolume(log));
  }

  async findOne(id: string, userId: string): Promise<WorkoutLogWithVolume> {
    const log = await this.logRepository.findOne({
      where: { id, userId },
      relations: ['exercises', 'exercises.sets', 'exercises.exercise'],
    });

    if (!log) {
      throw new NotFoundException('Workout log not found');
    }
    return this.withVolume(log);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateWorkoutLogDto,
  ): Promise<WorkoutLogWithVolume> {
    const log = await this.logRepository.findOne({
      where: { id, userId },
      relations: ['exercises', 'exercises.sets'], // Load relations to merge properly if needed
    });

    if (!log) {
      throw new NotFoundException('Workout log not found');
    }

    const updated = this.logRepository.merge(log, dto);
    const saved = await this.logRepository.save(updated);

    // We might need to reload to get the full graph if the DTO didn't include everything
    // or if we want to be sure about the volume calculation (e.g. if sets were changed).
    // Let's reload to be safe.
    return this.findOne(saved.id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.logRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Workout log not found');
    }
  }
}
