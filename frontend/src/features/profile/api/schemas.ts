import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Il nome deve avere almeno 2 caratteri'),
  age: z.number().min(13, 'Devi avere almeno 13 anni').max(120, 'Età non valida').optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  heightCm: z.number().min(100, 'Altezza minima 100cm').max(250, 'Altezza massima 250cm').optional().nullable(),
  athleteLevel: z.enum(['beginner', 'intermediate', 'advanced', 'competitive']).optional().nullable(),
  weeklyVolumeHours: z.number().min(0).max(168).optional().nullable(),
  // Altri campi opzionali
  mealsPerDay: z.string().optional().nullable(),
  mealTiming: z.string().optional().nullable(),
  macroTracking: z.string().optional().nullable(),
  supplements: z.string().optional().nullable(),
  trainingLog: z.string().optional().nullable(),
  heartRateMonitoring: z.string().optional().nullable(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

