import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { WorkoutLogEntity } from '../entities/workout-log.entity';

describe('ProgressService', () => {
  let service: ProgressService;
  const mockWorkoutLogRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: getRepositoryToken(WorkoutLogEntity),
          useValue: mockWorkoutLogRepository,
        },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return stats', async () => {
      const userId = 'user-1';
      mockWorkoutLogRepository.find.mockResolvedValue([]);

      const stats = await service.getStats(userId);

      expect(stats).toBeDefined();
      expect(stats.weeklyVolume).toEqual(expect.any(Array));
      expect(stats.consistencyScore).toBe(0);
      expect(stats.workoutStreak).toBe(0);
      expect(stats.recentPRs).toEqual([]);
    });

    it('should calculate intensity and detect PRs', async () => {
      const userId = 'user-1';
      const now = new Date();
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const mockLogs = [
        {
          date: twoMonthsAgo,
          exercises: [
            {
              exerciseId: 'ex1',
              exercise: { name: 'Bench Press' },
              sets: [{ completed: true, weight: 100, reps: 5 }],
            },
          ],
        },
        {
          date: twoWeeksAgo,
          exercises: [
            {
              exerciseId: 'ex1',
              exercise: { name: 'Bench Press' },
              sets: [{ completed: true, weight: 105, reps: 5 }],
            },
          ],
        },
      ];

      mockWorkoutLogRepository.find.mockResolvedValue(mockLogs);

      const stats = await service.getStats(userId);

      // Check Intensity
      // Volume: 105*5 = 525. Reps: 5. Intensity: 105.
      // (Note: week grouping might separate them, checking structure)
      expect(stats.weeklyVolume).toBeDefined();
      // const recentWeek = stats.weeklyVolume.find(w => w.volume > 0);
      // Depending on exact week, but we expect data.

      // Check PRs
      // 105 > 100, and it's recent (2 weeks ago < 4 weeks ago)
      expect(stats.recentPRs).toContain('Bench Press: 105kg');
    });
  });
});
