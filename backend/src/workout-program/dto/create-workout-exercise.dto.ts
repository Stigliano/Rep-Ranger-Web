import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsNumber } from 'class-validator';

export class CreateWorkoutExerciseDto {
  @IsString()
  @IsNotEmpty()
  // Can be a UUID or a string ID from external service
  exerciseId: string;

  @IsInt()
  @Min(1)
  @Max(20) // Reasonable max sets
  sets: number;

  @IsInt()
  @Min(1)
  @Max(100)
  reps: number;

  @IsNumber()
  @Min(0)
  @Max(500)
  weightKg: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  rpe?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @Min(0)
  orderIndex: number;
}
