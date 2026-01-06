import { apiClient as api } from '@/shared/lib/api/client';

export enum MuscleGroup {
  CHEST = 'CHEST',
  BACK = 'BACK',
  LEGS = 'LEGS',
  SHOULDERS = 'SHOULDERS',
  ARMS = 'ARMS',
  CORE = 'CORE',
  FULL_BODY = 'FULL_BODY',
  CARDIO = 'CARDIO',
  OTHER = 'OTHER',
}

export enum Equipment {
  BARBELL = 'BARBELL',
  DUMBBELL = 'DUMBBELL',
  MACHINE = 'MACHINE',
  CABLE = 'CABLE',
  BODYWEIGHT = 'BODYWEIGHT',
  KETTLEBELL = 'KETTLEBELL',
  OTHER = 'OTHER',
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseDto {
  name: string;
  description?: string;
  muscleGroup?: MuscleGroup;
  equipment?: Equipment;
  videoUrl?: string;
}

export interface UpdateExerciseDto extends Partial<CreateExerciseDto> {}

export const exercisesApi = {
  findAll: async (params?: { muscleGroup?: MuscleGroup; equipment?: Equipment; search?: string }) => {
    const { data } = await api.get<Exercise[]>('/exercises', { params });
    return data;
  },

  findOne: async (id: string) => {
    const { data } = await api.get<Exercise>(`/exercises/${id}`);
    return data;
  },

  create: async (exercise: CreateExerciseDto) => {
    const { data } = await api.post<Exercise>('/exercises', exercise);
    return data;
  },

  update: async (id: string, exercise: UpdateExerciseDto) => {
    const { data } = await api.patch<Exercise>(`/exercises/${id}`, exercise);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/exercises/${id}`);
  },
};

