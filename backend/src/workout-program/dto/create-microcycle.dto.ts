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
import { CreateWorkoutSessionDto } from './create-workout-session.dto';

export class CreateMicrocycleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  @Max(4)
  durationWeeks: number;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsString()
  @IsOptional()
  objectives?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutSessionDto)
  sessions: CreateWorkoutSessionDto[];
}
