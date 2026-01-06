import { apiClient } from '@/shared/lib/api/client';

export interface WeeklyVolume {
  weekStart: string;
  volume: number;
  workoutCount: number;
  avgIntensity: number;
}

export interface ProgressStats {
  weeklyVolume: WeeklyVolume[];
  consistencyScore: number;
  recentPRs: string[];
  workoutStreak: number;
}

export const progressApi = {
  getStats: async (): Promise<ProgressStats> => {
    const response = await apiClient.get<ProgressStats>('/progress/stats');
    return response.data;
  },
};

