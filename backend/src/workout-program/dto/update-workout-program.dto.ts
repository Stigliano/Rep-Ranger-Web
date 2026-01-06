import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkoutProgramDto } from './create-workout-program.dto';

/**
 * DTO per aggiornamento programma di allenamento
 * Tutti i campi sono opzionali
 */
export class UpdateWorkoutProgramDto extends PartialType(CreateWorkoutProgramDto) {}
