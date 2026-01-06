import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWorkoutExerciseDto } from './create-workout-exercise.dto';

export class CreateWorkoutSessionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDurationMinutes?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutExerciseDto)
  exercises: CreateWorkoutExerciseDto[];
}
