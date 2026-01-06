export class WeeklyVolumeDto {
  weekStart: string; // ISO Date
  volume: number; // Tonnage
  workoutCount: number;
  avgIntensity: number; // Average weight per rep
}

export class E1RMTrendDto {
  date: string; // ISO Date
  e1rm: number;
  exerciseName: string;
}

export class ProgressStatsDto {
  weeklyVolume: WeeklyVolumeDto[];
  consistencyScore: number; // 0-100
  recentPRs: string[]; // List of recent PR descriptions
  workoutStreak: number;
}
