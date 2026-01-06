import { apiClient } from '@/shared/lib/api/client';

export interface CreateWorkoutLogSetDto {
  setNumber: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  completed?: boolean;
}

export interface CreateWorkoutLogExerciseDto {
  exerciseId: string;
  orderIndex: number;
  notes?: string;
  sets: CreateWorkoutLogSetDto[];
}

export interface CreateWorkoutLogDto {
  sessionId?: string;
  date: string;
  durationMinutes?: number;
  rpe?: number; // Session RPE
  notes?: string;
  exercises?: CreateWorkoutLogExerciseDto[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  durationMinutes?: number;
  rpe?: number;
  notes?: string;
  totalVolume?: number;
  exercises: {
    id: string;
    exerciseId: string;
    exercise: {
      name: string;
    };
    sets: {
      setNumber: number;
      weight: number;
      reps: number;
      rpe: number;
    }[];
  }[];
}

export const trainingLogApi = {
  create: async (data: CreateWorkoutLogDto): Promise<WorkoutLog> => {
    const response = await apiClient.post<WorkoutLog>('/training-logs', data);
    return response.data;
  },
  findAll: async (): Promise<WorkoutLog[]> => {
    const response = await apiClient.get<WorkoutLog[]>('/training-logs');
    return response.data;
  },
};

