import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  MaxLength,
} from 'class-validator';

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
}

