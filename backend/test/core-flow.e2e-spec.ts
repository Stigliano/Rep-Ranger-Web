import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/auth/user.service';

describe('Core User Flow (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let authToken: string;
  let exerciseId: string;
  let sessionId: string;

  const uniqueId = Date.now();
  const testUser = {
    email: `flow_test_${uniqueId}@example.com`,
    password: 'Password123!',
    name: 'Flow Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    userService = moduleFixture.get<UserService>(UserService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Authentication
  describe('1. Authentication', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.user).toHaveProperty('id');
        });
    });

    it('should login and get token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          authToken = res.body.accessToken;
        });
    });

    it('should request password reset', () => {
      return request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);
    });

    it('should reset password with valid token', async () => {
      // Fetch token from DB via UserService
      const user = await userService.findByEmail(testUser.email);
      const resetToken = user.passwordResetToken;
      expect(resetToken).toBeDefined();

      const newPassword = 'NewPassword123!';
      
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: resetToken, newPassword })
        .expect(200);

      // Verify login with OLD password fails
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(401);

      // Verify login with NEW password works
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: newPassword })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          authToken = res.body.accessToken; // Update token for subsequent tests
        });
    });
  });

  // 2. Setup Data (Exercise)
  describe('2. Setup Data', () => {
    it('should create an exercise', () => {
      const exerciseData = {
        name: `Test Bench Press ${uniqueId}`,
        description: 'Standard barbell bench press',
        muscleGroup: 'CHEST',
        equipment: 'BARBELL',
      };

      return request(app.getHttpServer())
        .post('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exerciseData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          exerciseId = res.body.id;
        });
    });
  });

  // 3. Program Management
  describe('3. Program Management', () => {
    it('should create a workout program', () => {
      const programData = {
        name: `Strength Program ${uniqueId}`,
        description: 'A test strength program',
        durationWeeks: 4,
        microcycles: [
          {
            name: 'Microcycle 1',
            durationWeeks: 4,
            orderIndex: 0,
            sessions: [
              {
                name: 'Chest Day',
                dayOfWeek: 1,
                orderIndex: 0,
                exercises: [
                  {
                    exerciseId: exerciseId,
                    sets: 3,
                    reps: 5,
                    weightKg: 100,
                    orderIndex: 0,
                  },
                ],
              },
            ],
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/api/workout-programs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(programData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.microcycles).toHaveLength(1);
          expect(res.body.microcycles[0].sessions).toHaveLength(1);

          sessionId = res.body.microcycles[0].sessions[0].id;
        });
    });
  });

  // 4. Training Log
  describe('4. Training Log', () => {
    it('should log a completed workout session', () => {
      const logData = {
        sessionId: sessionId,
        date: new Date().toISOString(),
        durationMinutes: 60,
        rpe: 8,
        notes: 'Great workout',
        exercises: [
          {
            exerciseId: exerciseId,
            orderIndex: 0,
            sets: [
              { setNumber: 1, weight: 100, reps: 5, rpe: 8, completed: true },
              { setNumber: 2, weight: 100, reps: 5, rpe: 8.5, completed: true },
              { setNumber: 3, weight: 100, reps: 5, rpe: 9, completed: true },
            ],
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/api/training-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.exercises).toHaveLength(1);
        });
    });
  });

  // 5. Progress & Analytics
  describe('5. Progress & Analytics', () => {
    it('should retrieve updated progress stats', () => {
      return request(app.getHttpServer())
        .get('/api/progress/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          // Verify we have some volume from the logged workout
          // 3 sets * 5 reps * 100kg = 1500kg volume
          expect(res.body).toHaveProperty('weeklyVolume');
          const volumes = res.body.weeklyVolume;
          expect(volumes.length).toBeGreaterThan(0);

          // Find the current week's volume
          // Since we just logged it for "now", it should be in the last or current entry
          const totalVolume = volumes.reduce((sum, v) => sum + v.volume, 0);
          expect(totalVolume).toBeGreaterThanOrEqual(1500);

          // Verify workout streak/consistency
          expect(res.body.workoutStreak).toBeGreaterThanOrEqual(1);
        });
    });
  });
});
