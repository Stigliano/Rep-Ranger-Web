import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMicrocycleDto } from './create-microcycle.dto';

/**
 * DTO per creazione programma di allenamento
 */
export class CreateWorkoutProgramDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(52)
  durationWeeks: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  author?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMicrocycleDto)
  microcycles: CreateMicrocycleDto[];
}
