import { ProgramStatus } from '../../entities/workout-program.entity';
import { SessionStatus } from '../../entities/workout-session.entity';

/**
 * DTO per risposta programma di allenamento
 */
export class WorkoutProgramDto {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  durationWeeks: number;
  status: ProgramStatus;
  version: number;
  author: string | null;
  createdAt: Date;
  updatedAt: Date;
  microcycles: MicrocycleDto[];
}

/**
 * DTO per microciclo
 */
export class MicrocycleDto {
  id: string;
  programId: string;
  name: string;
  durationWeeks: number;
  orderIndex: number;
  objectives: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  sessions?: WorkoutSessionDto[];
}

/**
 * DTO per sessione
 */
export class WorkoutSessionDto {
  id: string;
  microcycleId: string;
  name: string;
  dayOfWeek: number;
  orderIndex: number;
  estimatedDurationMinutes: number | null;
  notes: string | null;
  status: SessionStatus;
  exercises?: WorkoutExerciseDto[];
}

/**
 * DTO per esercizio
 */
export class WorkoutExerciseDto {
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
