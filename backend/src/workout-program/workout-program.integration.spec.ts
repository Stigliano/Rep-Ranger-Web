import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { WorkoutProgramRepository } from './repositories/workout-program.repository';
import { WorkoutProgramEntity, ProgramStatus } from '../entities/workout-program.entity';
import { UserEntity } from '../entities/user.entity';
import { MicrocycleEntity } from '../entities/microcycle.entity';
import { WorkoutSessionEntity } from '../entities/workout-session.entity';
import { WorkoutExerciseEntity } from '../entities/workout-exercise.entity';
import { ExerciseEntity } from '../entities/exercise.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserSettingsEntity } from '../entities/user-settings.entity';
import { WorkoutLogEntity } from '../entities/workout-log.entity';
import { WorkoutLogExerciseEntity } from '../entities/workout-log-exercise.entity';
import { WorkoutLogSetEntity } from '../entities/workout-log-set.entity';

describe('WorkoutProgramRepository Integration', () => {
  let module: TestingModule;
  let repository: WorkoutProgramRepository;
  let dataSource: DataSource;
  let user: UserEntity;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'rapranger_app',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_NAME || 'rapranger',
          entities: [
            UserEntity,
            UserProfileEntity,
            UserSettingsEntity,
            WorkoutProgramEntity,
            MicrocycleEntity,
            WorkoutSessionEntity,
            WorkoutExerciseEntity,
            ExerciseEntity,
            WorkoutLogEntity,
            WorkoutLogExerciseEntity,
            WorkoutLogSetEntity,
          ],
          synchronize: false, // We use existing DB schema
        }),
        TypeOrmModule.forFeature([
          WorkoutProgramEntity,
          UserEntity,
          MicrocycleEntity,
          WorkoutSessionEntity,
          WorkoutExerciseEntity,
        ]),
      ],
      providers: [WorkoutProgramRepository],
    }).compile();

    repository = module.get<WorkoutProgramRepository>(WorkoutProgramRepository);
    dataSource = module.get<DataSource>(DataSource);

    // Create a test user
    const userRepo = dataSource.getRepository(UserEntity);
    user = await userRepo.save(
      userRepo.create({
        email: `test-integration-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        emailVerified: true,
      }),
    );
  });

  afterAll(async () => {
    // Cleanup
    if (user) {
      const userRepo = dataSource.getRepository(UserEntity);
      await userRepo.remove(user);
    }
    await module.close();
  });

  it('should update nested microcycles when updating program', async () => {
    // 1. Create a program with one microcycle
    const programData = {
      userId: user.id,
      name: 'Integration Test Program',
      durationWeeks: 4,
      status: ProgramStatus.DRAFT,
      microcycles: [
        {
          name: 'Microcycle 1',
          durationWeeks: 4,
          orderIndex: 0,
          sessions: [],
        },
      ],
    };

    const created = await repository.create(programData);
    expect(created.id).toBeDefined();
    expect(created.microcycles).toHaveLength(1);
    expect(created.microcycles[0].name).toBe('Microcycle 1');

    // 2. Update the program changing microcycle name and adding a session
    // This replicates the structure passed from Service to Repository
    const updateData = {
      ...created,
      name: 'Updated Program Name',
      microcycles: [
        {
          ...created.microcycles[0],
          name: 'Updated Microcycle Name',
          sessions: [
            {
              name: 'New Session',
              dayOfWeek: 1,
              orderIndex: 0,
              estimatedDurationMinutes: 60,
              exercises: [],
            },
          ],
        },
      ],
    };

    // 3. Perform Update
    await repository.update(created.id, updateData);

    // 4. Verify updates
    const updated = await repository.findByIdAndUserId(created.id, user.id);

    // Check root property update (should work even with simple update)
    expect(updated?.name).toBe('Updated Program Name');

    // Check nested property update (THIS IS EXPECTED TO FAIL with current implementation)
    expect(updated?.microcycles).toBeDefined();
    expect(updated?.microcycles[0].name).toBe('Updated Microcycle Name');
    expect(updated?.microcycles[0].sessions).toHaveLength(1);
    expect(updated?.microcycles[0].sessions[0].name).toBe('New Session');
  });
});
