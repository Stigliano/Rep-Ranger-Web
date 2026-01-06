import { z } from 'zod';

export const createWorkoutExerciseSchema = z.object({
  id: z.string().optional(),
  exerciseId: z.string().uuid(),
  uiName: z.string().optional(), // Frontend only
  sets: z.number().min(1, 'Almeno 1 serie'),
  reps: z.number().min(1, 'Almeno 1 ripetizione'),
  weightKg: z.number().min(0, 'Peso non valido'),
  rpe: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
  orderIndex: z.number(),
});

export const createWorkoutSessionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome sessione obbligatorio'),
  dayOfWeek: z.number().min(1).max(7),
  orderIndex: z.number(),
  estimatedDurationMinutes: z.number().optional(),
  notes: z.string().optional(),
  exercises: z.array(createWorkoutExerciseSchema).min(1, 'Aggiungi almeno un esercizio'),
});

export const createMicrocycleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome microciclo obbligatorio'),
  durationWeeks: z.number().min(1, 'Durata minima 1 settimana'),
  orderIndex: z.number(),
  objectives: z.string().optional(),
  notes: z.string().optional(),
  sessions: z.array(createWorkoutSessionSchema).min(1, 'Aggiungi almeno una sessione'),
});

export const createWorkoutProgramSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Il nome deve essere di almeno 3 caratteri'),
  description: z.string().optional(),
  durationWeeks: z.number().min(1, 'Durata minima 1 settimana'),
  microcycles: z.array(createMicrocycleSchema).min(1, 'Il programma deve avere almeno un microciclo'),
});

export type CreateWorkoutProgramSchema = z.infer<typeof createWorkoutProgramSchema>;

