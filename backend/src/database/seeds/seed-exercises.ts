import { AppDataSource } from '../data-source';
import { ExerciseEntity, MuscleGroup, Equipment } from '../../entities/exercise.entity';

const exercises = [
  {
    name: 'Barbell Squat',
    description: 'Compound exercise for legs.',
    muscleGroup: MuscleGroup.LEGS,
    equipment: Equipment.BARBELL,
    videoUrl: 'https://example.com/squat',
  },
  {
    name: 'Bench Press',
    description: 'Compound exercise for chest.',
    muscleGroup: MuscleGroup.CHEST,
    equipment: Equipment.BARBELL,
    videoUrl: 'https://example.com/bench',
  },
  {
    name: 'Deadlift',
    description: 'Compound exercise for back and legs.',
    muscleGroup: MuscleGroup.BACK, // Or LEGS, keeping simplified
    equipment: Equipment.BARBELL,
    videoUrl: 'https://example.com/deadlift',
  },
  {
    name: 'Overhead Press',
    description: 'Compound exercise for shoulders.',
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: Equipment.BARBELL,
    videoUrl: 'https://example.com/ohp',
  },
  {
    name: 'Pull Up',
    description: 'Compound exercise for back.',
    muscleGroup: MuscleGroup.BACK,
    equipment: Equipment.BODYWEIGHT,
    videoUrl: 'https://example.com/pullup',
  },
  {
    name: 'Dumbbell Row',
    description: 'Isolation/Compound for back.',
    muscleGroup: MuscleGroup.BACK,
    equipment: Equipment.DUMBBELL,
    videoUrl: 'https://example.com/db-row',
  },
  {
    name: 'Dumbbell Curl',
    description: 'Isolation for biceps.',
    muscleGroup: MuscleGroup.ARMS,
    equipment: Equipment.DUMBBELL,
    videoUrl: 'https://example.com/curl',
  },
  {
    name: 'Tricep Pushdown',
    description: 'Isolation for triceps.',
    muscleGroup: MuscleGroup.ARMS,
    equipment: Equipment.CABLE,
    videoUrl: 'https://example.com/pushdown',
  },
  {
    name: 'Leg Press',
    description: 'Compound machine exercise for legs.',
    muscleGroup: MuscleGroup.LEGS,
    equipment: Equipment.MACHINE,
    videoUrl: 'https://example.com/leg-press',
  },
  {
    name: 'Crunch',
    description: 'Isolation for core.',
    muscleGroup: MuscleGroup.CORE,
    equipment: Equipment.BODYWEIGHT,
    videoUrl: 'https://example.com/crunch',
  },
];

async function seed() {
  try {
    console.log('Initializing DataSource...');
    await AppDataSource.initialize();
    console.log('DataSource initialized.');

    const repository = AppDataSource.getRepository(ExerciseEntity);

    console.log('Checking existing exercises...');
    const count = await repository.count();

    if (count > 0) {
      console.log(`Found ${count} exercises. Skipping seed.`);
      return;
    }

    console.log('Seeding exercises...');
    for (const exercise of exercises) {
      const entity = repository.create(exercise);
      await repository.save(entity);
      console.log(`Created: ${exercise.name}`);
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding exercises:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
