import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ExerciseRepository } from './repositories/exercise.repository';
import { ExerciseEntity, MuscleGroup, Equipment } from '../entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseDto } from './dto/exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async findAll(
    muscleGroup?: MuscleGroup,
    equipment?: Equipment,
    search?: string,
  ): Promise<ExerciseDto[]> {
    const exercises = await this.exerciseRepository.findAll(muscleGroup, equipment, search);
    return exercises.map((e) => this.toDto(e));
  }

  async findOne(id: string): Promise<ExerciseDto> {
    const exercise = await this.exerciseRepository.findById(id);
    if (!exercise) {
      throw new NotFoundException('Esercizio non trovato');
    }
    return this.toDto(exercise);
  }

  async create(createDto: CreateExerciseDto): Promise<ExerciseDto> {
    const existing = await this.exerciseRepository.findByName(createDto.name);
    if (existing) {
      throw new ConflictException('Esiste già un esercizio con questo nome');
    }

    const exercise = await this.exerciseRepository.create(createDto);
    return this.toDto(exercise);
  }

  async update(id: string, updateDto: UpdateExerciseDto): Promise<ExerciseDto> {
    const existing = await this.exerciseRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Esercizio non trovato');
    }

    if (updateDto.name && updateDto.name !== existing.name) {
      const nameConflict = await this.exerciseRepository.findByName(updateDto.name);
      if (nameConflict) {
        throw new ConflictException('Esiste già un esercizio con questo nome');
      }
    }

    const updated = await this.exerciseRepository.update(id, updateDto);
    return this.toDto(updated);
  }

  async remove(id: string): Promise<void> {
    await this.exerciseRepository.delete(id);
  }

  async seed(): Promise<void> {
    const count = await this.exerciseRepository.count();
    if (count > 0) return;

    const defaults = [
      {
        name: 'Panca Piana',
        muscleGroup: MuscleGroup.CHEST,
        equipment: Equipment.BARBELL,
        description: 'Esercizio fondamentale per pettorali',
      },
      {
        name: 'Squat',
        muscleGroup: MuscleGroup.LEGS,
        equipment: Equipment.BARBELL,
        description: 'Esercizio fondamentale per gambe',
      },
      {
        name: 'Stacco da Terra',
        muscleGroup: MuscleGroup.BACK,
        equipment: Equipment.BARBELL,
        description: 'Esercizio fondamentale per schiena e catena posteriore',
      },
      {
        name: 'Military Press',
        muscleGroup: MuscleGroup.SHOULDERS,
        equipment: Equipment.BARBELL,
        description: 'Spinte sopra la testa per spalle',
      },
      {
        name: 'Trazioni alla sbarra',
        muscleGroup: MuscleGroup.BACK,
        equipment: Equipment.BODYWEIGHT,
        description: 'Trazioni per dorsali',
      },
      {
        name: 'Dip alle parallele',
        muscleGroup: MuscleGroup.CHEST,
        equipment: Equipment.BODYWEIGHT,
        description: 'Spinte alle parallele per petto e tricipiti',
      },
      {
        name: 'Curl Bilanciere',
        muscleGroup: MuscleGroup.ARMS,
        equipment: Equipment.BARBELL,
        description: 'Esercizio base per bicipiti',
      },
      {
        name: 'French Press',
        muscleGroup: MuscleGroup.ARMS,
        equipment: Equipment.BARBELL,
        description: 'Esercizio di isolamento per tricipiti',
      },
      {
        name: 'Crunch',
        muscleGroup: MuscleGroup.CORE,
        equipment: Equipment.BODYWEIGHT,
        description: 'Esercizio base per addominali',
      },
      {
        name: 'Plank',
        muscleGroup: MuscleGroup.CORE,
        equipment: Equipment.BODYWEIGHT,
        description: 'Esercizio isometrico per core',
      },
      {
        name: 'Affondi con Manubri',
        muscleGroup: MuscleGroup.LEGS,
        equipment: Equipment.DUMBBELL,
        description: 'Esercizio unilaterale per gambe',
      },
      {
        name: 'Lat Machine Avanti',
        muscleGroup: MuscleGroup.BACK,
        equipment: Equipment.MACHINE,
        description: 'Trazioni al cavo per dorsali',
      },
      {
        name: 'Panca Inclinata Manubri',
        muscleGroup: MuscleGroup.CHEST,
        equipment: Equipment.DUMBBELL,
        description: 'Spinte su panca inclinata per petto alto',
      },
      {
        name: 'Alzate Laterali',
        muscleGroup: MuscleGroup.SHOULDERS,
        equipment: Equipment.DUMBBELL,
        description: 'Esercizio di isolamento per deltoidi laterali',
      },
      {
        name: 'Leg Press',
        muscleGroup: MuscleGroup.LEGS,
        equipment: Equipment.MACHINE,
        description: 'Pressa per gambe',
      },
      {
        name: 'Push Down Tricipiti',
        muscleGroup: MuscleGroup.ARMS,
        equipment: Equipment.CABLE,
        description: 'Spinte in basso al cavo per tricipiti',
      },
      {
        name: 'Curl con Manubri',
        muscleGroup: MuscleGroup.ARMS,
        equipment: Equipment.DUMBBELL,
        description: 'Flessione avambracci con manubri',
      },
      {
        name: 'Corsa',
        muscleGroup: MuscleGroup.CARDIO,
        equipment: Equipment.OTHER,
        description: 'Attività cardio',
      },
    ];

    for (const ex of defaults) {
      await this.exerciseRepository.create(ex);
    }
  }

  private toDto(exercise: ExerciseEntity): ExerciseDto {
    return {
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      videoUrl: exercise.videoUrl,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  }
}
