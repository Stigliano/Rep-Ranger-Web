import { ProgramStatus } from '../../entities/workout-program.entity';

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
}

