import { MuscleGroup, Equipment } from '../../entities/exercise.entity';

export class ExerciseDto {
  id: string;
  name: string;
  description?: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
