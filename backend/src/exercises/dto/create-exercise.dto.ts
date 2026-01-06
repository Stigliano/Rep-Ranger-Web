import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { MuscleGroup, Equipment } from '../../entities/exercise.entity';
import { Transform } from 'class-transformer';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsEnum(MuscleGroup)
  @IsOptional()
  muscleGroup?: MuscleGroup;

  @IsEnum(Equipment)
  @IsOptional()
  equipment?: Equipment;

  @IsUrl()
  @IsOptional()
  videoUrl?: string;
}
