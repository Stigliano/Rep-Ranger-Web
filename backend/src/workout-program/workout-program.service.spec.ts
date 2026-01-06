import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkoutProgramService } from './workout-program.service';
import { WorkoutProgramRepository } from './repositories/workout-program.repository';
import { WorkoutProgramEntity, ProgramStatus } from '../entities/workout-program.entity';
import { MicrocycleEntity } from '../entities/microcycle.entity';
import { WorkoutSessionEntity } from '../entities/workout-session.entity';
import { UserEntity } from '../entities/user.entity';
import { CreateWorkoutProgramDto } from './dto/create-workout-program.dto';
import { CreateMicrocycleDto } from './dto/create-microcycle.dto';
import { UpdateWorkoutProgramDto } from './dto/update-workout-program.dto';

/**
 * Unit test per WorkoutProgramService
 * Testa logica di business per gestione programmi di allenamento
 */
describe('WorkoutProgramService', () => {
  let service: WorkoutProgramService;
  let repository: jest.Mocked<WorkoutProgramRepository>;

  // Mock dati per i test
  const userId = 'test-user-id';
  const mockProgram: WorkoutProgramEntity = {
    id: 'test-program-id',
    userId: userId,
    name: 'Test Program',
    description: 'Test Description',
    durationWeeks: 4,
    status: ProgramStatus.DRAFT,
    version: 1,
    author: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    microcycles: [],
    user: {} as unknown as UserEntity, // Mock user relation
  };

  beforeEach(async () => {
    // Mock WorkoutProgramRepository
    const mockRepository = {
      findByUserId: jest.fn(),
      findByIdAndUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutProgramService,
        {
          provide: WorkoutProgramRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WorkoutProgramService>(WorkoutProgramService);
    repository = module.get(WorkoutProgramRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('dovrebbe ritornare tutti i programmi di un utente', async () => {
      // Arrange
      const programs = [mockProgram];
      repository.findByUserId.mockResolvedValue(programs);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockProgram.id);
      expect(result[0].name).toBe(mockProgram.name);
      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('dovrebbe ritornare array vuoto se nessun programma trovato', async () => {
      // Arrange
      repository.findByUserId.mockResolvedValue([]);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(result).toEqual([]);
      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('dovrebbe ritornare programma per ID e userId', async () => {
      // Arrange
      const programId = mockProgram.id;
      repository.findByIdAndUserId.mockResolvedValue(mockProgram);

      // Act
      const result = await service.findOne(programId, userId);

      // Assert
      expect(result.id).toBe(programId);
      expect(result.name).toBe(mockProgram.name);
      expect(repository.findByIdAndUserId).toHaveBeenCalledWith(programId, userId);
    });

    it('dovrebbe lanciare NotFoundException se programma non trovato', async () => {
      // Arrange
      const programId = 'non-existent-id';
      repository.findByIdAndUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(programId, userId)).rejects.toThrow(NotFoundException);
      expect(repository.findByIdAndUserId).toHaveBeenCalledWith(programId, userId);
    });
  });

  describe('create', () => {
    it('dovrebbe creare nuovo programma in stato DRAFT', async () => {
      // Arrange
      const createDto: CreateWorkoutProgramDto = {
        name: 'New Program',
        description: 'New Description',
        durationWeeks: 8,
        microcycles: [],
      };
      const createdProgram = { ...mockProgram, ...createDto };
      repository.create.mockResolvedValue(createdProgram as unknown as WorkoutProgramEntity);

      // Act
      const result = await service.create(userId, createDto);

      // Assert
      expect(result.name).toBe(createDto.name);
      expect(result.status).toBe(ProgramStatus.DRAFT);
      expect(result.version).toBe(1);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          userId,
          status: ProgramStatus.DRAFT,
          version: 1,
        }),
      );
    });

    it('dovrebbe validare durata totale microcicli se presenti', async () => {
      // Arrange
      const createDto: CreateWorkoutProgramDto = {
        name: 'Invalid Duration Program',
        durationWeeks: 4,
        microcycles: [
          {
            name: 'Micro 1',
            durationWeeks: 2,
            orderIndex: 0,
            sessions: [],
          },
        ] as unknown as CreateMicrocycleDto[], // Cast to avoid full DTO construction in test
      };

      // Act & Assert
      await expect(service.create(userId, createDto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('dovrebbe validare ordine sequenziale microcicli', async () => {
      // Arrange
      const createDto: CreateWorkoutProgramDto = {
        name: 'Invalid Order Program',
        durationWeeks: 4,
        microcycles: [
          {
            name: 'Micro 1',
            durationWeeks: 2,
            orderIndex: 0,
            sessions: [],
          },
          {
            name: 'Micro 2',
            durationWeeks: 2,
            orderIndex: 2, // Gap in sequence
            sessions: [],
          },
        ] as unknown as CreateMicrocycleDto[],
      };

      // Act & Assert
      await expect(service.create(userId, createDto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('dovrebbe creare programma con microcicli, sessioni ed esercizi', async () => {
      // Arrange
      const createDto: CreateWorkoutProgramDto = {
        name: 'Full Program',
        durationWeeks: 4,
        microcycles: [
          {
            name: 'Micro 1',
            durationWeeks: 4,
            orderIndex: 0,
            sessions: [
              {
                name: 'Session 1',
                dayOfWeek: 1,
                orderIndex: 0,
                exercises: [
                  {
                    exerciseId: 'ex1',
                    sets: 3,
                    reps: 10,
                    weightKg: 50,
                    orderIndex: 0,
                  },
                ],
              },
            ],
          },
        ] as unknown as CreateMicrocycleDto[],
      };

      const createdProgram = {
        ...mockProgram,
        ...createDto,
        microcycles: createDto.microcycles.map((m) => ({
          ...m,
          id: 'm-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          programId: mockProgram.id, // Add programId
          program: {} as unknown as WorkoutProgramEntity, // Add program relation
          sessions: m.sessions.map((s) => ({
            ...s,
            id: 's-id',
            status: 'scheduled',
            createdAt: new Date(),
            updatedAt: new Date(),
            microcycleId: 'm-id', // Add microcycleId
            microcycle: {} as unknown as MicrocycleEntity, // Add microcycle relation
            exercises: s.exercises.map((e) => ({
              ...e,
              id: 'e-id',
              createdAt: new Date(),
              updatedAt: new Date(),
              sessionId: 's-id', // Add sessionId
              session: {} as unknown as WorkoutSessionEntity, // Add session relation
            })),
          })),
        })),
      } as unknown as WorkoutProgramEntity;

      repository.create.mockResolvedValue(createdProgram);

      // Act
      const result = await service.create(userId, createDto);

      // Assert
      expect(result.name).toBe('Full Program');
      expect(result.microcycles).toHaveLength(1);
      expect(result.microcycles[0].sessions).toHaveLength(1);
      expect(result.microcycles[0].sessions[0].exercises).toHaveLength(1);

      // Verify repository call structure
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          name: 'Full Program',
          microcycles: expect.arrayContaining([
            expect.objectContaining({
              name: 'Micro 1',
              sessions: expect.arrayContaining([
                expect.objectContaining({
                  name: 'Session 1',
                  exercises: expect.arrayContaining([
                    expect.objectContaining({
                      exerciseId: 'ex1',
                    }),
                  ]),
                }),
              ]),
            }),
          ]),
        }),
      );
    });

    it('dovrebbe lanciare BadRequestException se durationWeeks < 1', async () => {
      // Arrange
      const createDto: CreateWorkoutProgramDto = {
        name: 'New Program',
        durationWeeks: 0,
        microcycles: [],
      };

      // Act & Assert
      await expect(service.create(userId, createDto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare BadRequestException se durationWeeks > 52', async () => {
      // Arrange
      const createDto: CreateWorkoutProgramDto = {
        name: 'New Program',
        durationWeeks: 53,
        microcycles: [],
      };

      // Act & Assert
      await expect(service.create(userId, createDto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('dovrebbe aggiornare programma esistente', async () => {
      // Arrange
      const programId = mockProgram.id;
      const updateDto: UpdateWorkoutProgramDto = {
        name: 'Updated Program',
      };
      const updatedProgram = { ...mockProgram, ...updateDto };
      repository.findByIdAndUserId.mockResolvedValue(mockProgram);
      repository.update.mockResolvedValue(updatedProgram as unknown as WorkoutProgramEntity);

      // Act
      const result = await service.update(programId, userId, updateDto);

      // Assert
      expect(result.name).toBe(updateDto.name);
      expect(repository.findByIdAndUserId).toHaveBeenCalledWith(programId, userId);
      expect(repository.update).toHaveBeenCalledWith(programId, updateDto);
    });

    it('dovrebbe lanciare NotFoundException se programma non trovato', async () => {
      // Arrange
      const programId = 'non-existent-id';
      const updateDto: UpdateWorkoutProgramDto = {
        name: 'Updated Program',
      };
      repository.findByIdAndUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(programId, userId, updateDto)).rejects.toThrow(NotFoundException);
      expect(repository.findByIdAndUserId).toHaveBeenCalledWith(programId, userId);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('dovrebbe validare durationWeeks se presente in updateDto', async () => {
      // Arrange
      const programId = mockProgram.id;
      const updateDto: UpdateWorkoutProgramDto = {
        durationWeeks: 53, // invalido
      };
      repository.findByIdAndUserId.mockResolvedValue(mockProgram);

      // Act & Assert
      await expect(service.update(programId, userId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findByIdAndUserId).toHaveBeenCalledWith(programId, userId);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('dovrebbe accettare durationWeeks valido in updateDto', async () => {
      // Arrange
      const programId = mockProgram.id;
      const updateDto: UpdateWorkoutProgramDto = {
        durationWeeks: 12,
      };
      const updatedProgram = { ...mockProgram, ...updateDto };
      repository.findByIdAndUserId.mockResolvedValue(mockProgram);
      repository.update.mockResolvedValue(updatedProgram as unknown as WorkoutProgramEntity);

      // Act
      const result = await service.update(programId, userId, updateDto);

      // Assert
      expect(result.durationWeeks).toBe(12);
      expect(repository.update).toHaveBeenCalledWith(programId, updateDto);
    });
  });

  describe('remove', () => {
    it('dovrebbe eliminare programma esistente', async () => {
      // Arrange
      const programId = mockProgram.id;
      repository.delete.mockResolvedValue(undefined);

      // Act
      await service.remove(programId, userId);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(programId, userId);
    });
  });

  describe('updateStatus', () => {
    it('dovrebbe aggiornare status programma', async () => {
      // Arrange
      const programId = mockProgram.id;
      const newStatus = ProgramStatus.ACTIVE;
      const updatedProgram = { ...mockProgram, status: newStatus };
      repository.findByIdAndUserId.mockResolvedValue(mockProgram);
      repository.update.mockResolvedValue(updatedProgram as unknown as WorkoutProgramEntity);

      // Act
      const result = await service.updateStatus(programId, userId, newStatus);

      // Assert
      expect(result.status).toBe(newStatus);
      expect(repository.findByIdAndUserId).toHaveBeenCalledWith(programId, userId);
      expect(repository.update).toHaveBeenCalledWith(programId, {
        status: newStatus,
      });
    });

    it('dovrebbe lanciare NotFoundException se programma non trovato', async () => {
      // Arrange
      const programId = 'non-existent-id';
      const newStatus = ProgramStatus.ACTIVE;
      repository.findByIdAndUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateStatus(programId, userId, newStatus)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findByIdAndUserId).toHaveBeenCalledWith(programId, userId);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
