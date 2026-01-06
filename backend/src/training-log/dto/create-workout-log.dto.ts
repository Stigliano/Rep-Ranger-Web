import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateWorkoutLogSetDto {
  @IsInt()
  @Min(1)
  setNumber: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  reps?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  rpe?: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class CreateWorkoutLogExerciseDto {
  @IsUUID()
  exerciseId: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutLogSetDto)
  sets: CreateWorkoutLogSetDto[];
}

export class CreateWorkoutLogDto {
  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @IsDateString()
  date: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  durationMinutes?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  rpe?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutLogExerciseDto)
  @IsOptional()
  exercises?: CreateWorkoutLogExerciseDto[];
}
