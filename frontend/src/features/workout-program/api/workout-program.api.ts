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
  sessions: WorkoutSession[];
}

export interface WorkoutSession {
  id: string;
  microcycleId: string;
  name: string;
  dayOfWeek: number;
  orderIndex: number;
  estimatedDurationMinutes: number | null;
  notes: string | null;
  status: 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'skipped' | 'archived';
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName?: string;
  sets: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
  notes: string | null;
  orderIndex: number;
}

export interface CreateWorkoutExerciseDto {
  exerciseId: string;
  sets: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  notes?: string;
  orderIndex: number;
}

export interface CreateWorkoutSessionDto {
  name: string;
  dayOfWeek: number;
  orderIndex: number;
  estimatedDurationMinutes?: number;
  notes?: string;
  exercises: CreateWorkoutExerciseDto[];
}

export interface CreateMicrocycleDto {
  name: string;
  durationWeeks: number;
  orderIndex: number;
  objectives?: string;
  notes?: string;
  sessions: CreateWorkoutSessionDto[];
}

export interface CreateWorkoutProgramDto {
  name: string;
  description?: string;
  durationWeeks: number;
  author?: string;
  microcycles: CreateMicrocycleDto[];
}

export interface UpdateWorkoutExerciseDto extends Partial<CreateWorkoutExerciseDto> {
  id?: string;
}

export interface UpdateWorkoutSessionDto extends Partial<Omit<CreateWorkoutSessionDto, 'exercises'>> {
  id?: string;
  exercises?: UpdateWorkoutExerciseDto[];
}

export interface UpdateMicrocycleDto extends Partial<Omit<CreateMicrocycleDto, 'sessions'>> {
  id?: string;
  sessions?: UpdateWorkoutSessionDto[];
}

export interface UpdateWorkoutProgramDto {
  name?: string;
  description?: string;
  durationWeeks?: number;
  author?: string;
  microcycles?: UpdateMicrocycleDto[];
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
