import { apiClient } from '@/shared/lib/api/client';

export interface WorkoutProgram {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  durationWeeks: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  version: number;
  author: string | null;
  createdAt: string;
  updatedAt: string;
  microcycles: Microcycle[];
}

export interface Microcycle {
  id: string;
  programId: string;
  name: string;
  durationWeeks: number;
  orderIndex: number;
  objectives: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutProgramDto {
  name: string;
  description?: string;
  durationWeeks: number;
  author?: string;
}

export interface UpdateWorkoutProgramDto {
  name?: string;
  description?: string;
  durationWeeks?: number;
  author?: string;
}

/**
 * API client per workout programs
 */
export const workoutProgramApi = {
  /**
   * Lista tutti i programmi
   */
  findAll: async (): Promise<WorkoutProgram[]> => {
    const response = await apiClient.get<WorkoutProgram[]>('/workout-programs');
    return response.data;
  },

  /**
   * Dettaglio programma
   */
  findOne: async (id: string): Promise<WorkoutProgram> => {
    const response = await apiClient.get<WorkoutProgram>(
      `/workout-programs/${id}`,
    );
    return response.data;
  },

  /**
   * Crea nuovo programma
   */
  create: async (data: CreateWorkoutProgramDto): Promise<WorkoutProgram> => {
    const response = await apiClient.post<WorkoutProgram>(
      '/workout-programs',
      data,
    );
    return response.data;
  },

  /**
   * Aggiorna programma
   */
  update: async (
    id: string,
    data: UpdateWorkoutProgramDto,
  ): Promise<WorkoutProgram> => {
    const response = await apiClient.patch<WorkoutProgram>(
      `/workout-programs/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Elimina programma
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/workout-programs/${id}`);
  },
};

