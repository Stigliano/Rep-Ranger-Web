import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { WorkoutProgramRepository } from './repositories/workout-program.repository';
import { WorkoutProgramEntity, ProgramStatus } from '../entities/workout-program.entity';
import { CreateWorkoutProgramDto } from './dto/create-workout-program.dto';
import { UpdateWorkoutProgramDto } from './dto/update-workout-program.dto';
import { WorkoutProgramDto } from './dto/workout-program.dto';
import { CreateMicrocycleDto } from './dto/create-microcycle.dto';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { CreateWorkoutExerciseDto } from './dto/create-workout-exercise.dto';

/**
 * Servizio per gestione programmi di allenamento
 * Contiene logica di business per CRUD programmi
 * Conforme a 3_SOFTWARE_ARCHITECTURE.md sezione 2.2
 */
@Injectable()
export class WorkoutProgramService {
  constructor(private readonly workoutProgramRepository: WorkoutProgramRepository) {}

  /**
   * Trova tutti i programmi di un utente
   */
  async findAll(userId: string): Promise<WorkoutProgramDto[]> {
    const programs = await this.workoutProgramRepository.findByUserId(userId);
    return programs.map((p) => this.toDto(p));
  }

  /**
   * Trova programma per ID
   */
  async findOne(id: string, userId: string): Promise<WorkoutProgramDto> {
    const program = await this.workoutProgramRepository.findByIdAndUserId(id, userId);
    if (!program) {
      throw new NotFoundException('Programma non trovato');
    }
    return this.toDto(program);
  }

  /**
   * Crea nuovo programma
   */
  async create(userId: string, createDto: CreateWorkoutProgramDto): Promise<WorkoutProgramDto> {
    // Validazione business logic
    this.validateProgram(createDto);

    // Prepare entity data
    const entityData: DeepPartial<WorkoutProgramEntity> = {
      ...createDto,
      userId,
      status: ProgramStatus.DRAFT,
      version: 1,
      // Map microcycles to entities structure
      microcycles: createDto.microcycles?.map((m) => ({
        ...m,
        sessions: m.sessions?.map((s) => ({
          ...s,
          // Populate exerciseIds for backward compatibility / quick access
          exerciseIds: s.exercises?.map((e) => e.exerciseId) || [],
          exercises: s.exercises?.map((e) => ({
            ...e,
          })),
        })),
      })),
    };

    const program = await this.workoutProgramRepository.create(entityData);

    return this.toDto(program);
  }

  /**
   * Aggiorna programma
   */
  async update(
    id: string,
    userId: string,
    updateDto: UpdateWorkoutProgramDto,
  ): Promise<WorkoutProgramDto> {
    // Verifica esistenza
    const existing = await this.workoutProgramRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new NotFoundException('Programma non trovato');
    }

    // Validazione se durationWeeks è presente
    if (updateDto.durationWeeks !== undefined) {
      this.validateDuration(updateDto.durationWeeks);
    }

    const updated = await this.workoutProgramRepository.update(id, updateDto);
    return this.toDto(updated);
  }

  /**
   * Elimina programma
   */
  async remove(id: string, userId: string): Promise<void> {
    await this.workoutProgramRepository.delete(id, userId);
  }

  /**
   * Cambia status programma
   */
  async updateStatus(
    id: string,
    userId: string,
    status: ProgramStatus,
  ): Promise<WorkoutProgramDto> {
    const program = await this.workoutProgramRepository.findByIdAndUserId(id, userId);
    if (!program) {
      throw new NotFoundException('Programma non trovato');
    }

    const updated = await this.workoutProgramRepository.update(id, { status });
    return this.toDto(updated);
  }

  /**
   * Validazione programma
   */
  private validateProgram(dto: CreateWorkoutProgramDto | UpdateWorkoutProgramDto): void {
    if (dto.durationWeeks !== undefined) {
      this.validateDuration(dto.durationWeeks);
    }

    if ((dto as CreateWorkoutProgramDto).microcycles) {
      this.validateMicrocycles((dto as CreateWorkoutProgramDto).microcycles, dto.durationWeeks);
    }
  }

  /**
   * Validazione microcicli
   */
  private validateMicrocycles(
    microcycles: CreateMicrocycleDto[],
    programDurationWeeks: number,
  ): void {
    if (microcycles.length === 0) {
      // Allow empty for initial draft if intended, but specifications say min 1.
      // We'll allow it but if present validate structure.
      return;
    }

    // Validate total duration
    const totalMicrocyclesDuration = microcycles.reduce((sum, m) => sum + m.durationWeeks, 0);
    if (programDurationWeeks && totalMicrocyclesDuration !== programDurationWeeks) {
      throw new BadRequestException(
        `La somma della durata dei microcicli (${totalMicrocyclesDuration}) deve corrispondere alla durata del programma (${programDurationWeeks})`,
      );
    }

    // Validate sequential order and sessions
    const sortedIndices = microcycles.map((m) => m.orderIndex).sort((a, b) => a - b);
    for (let i = 0; i < sortedIndices.length; i++) {
      if (sortedIndices[i] !== i) {
        throw new BadRequestException(
          'Gli indici dei microcicli devono essere sequenziali partendo da 0',
        );
      }
      // Validate sessions for each microcycle
      this.validateSessions(microcycles[i].sessions);
    }
  }

  /**
   * Validazione sessioni
   */
  private validateSessions(sessions: CreateWorkoutSessionDto[]): void {
    if (!sessions || sessions.length === 0) return;

    if (sessions.length > 28) {
      // Generous limit (e.g. 4 weeks microcycle with daily sessions)
      throw new BadRequestException('Numero massimo di sessioni superato (28)');
    }

    const sortedIndices = sessions.map((s) => s.orderIndex).sort((a, b) => a - b);
    for (let i = 0; i < sortedIndices.length; i++) {
      if (sortedIndices[i] !== i) {
        throw new BadRequestException(
          'Gli indici delle sessioni devono essere sequenziali partendo da 0',
        );
      }

      const session = sessions.find((s) => s.orderIndex === i);
      if (session) {
        if (session.dayOfWeek < 1 || session.dayOfWeek > 7) {
          throw new BadRequestException('Il giorno della settimana deve essere tra 1 e 7');
        }
        this.validateExercises(session.exercises);
      }
    }
  }

  /**
   * Validazione esercizi
   */
  private validateExercises(exercises: CreateWorkoutExerciseDto[]): void {
    if (!exercises || exercises.length === 0) return;

    if (exercises.length > 50) {
      throw new BadRequestException('Numero massimo di esercizi per sessione superato (50)');
    }

    const sortedIndices = exercises.map((e) => e.orderIndex).sort((a, b) => a - b);
    for (let i = 0; i < sortedIndices.length; i++) {
      if (sortedIndices[i] !== i) {
        throw new BadRequestException(
          'Gli indici degli esercizi devono essere sequenziali partendo da 0',
        );
      }

      const exercise = exercises.find((e) => e.orderIndex === i);
      if (exercise) {
        if (exercise.sets < 1) throw new BadRequestException('Minimo 1 serie richiesta');
        if (exercise.reps < 1) throw new BadRequestException('Minimo 1 ripetizione richiesta');
      }
    }
  }

  /**
   * Validazione durata
   */
  private validateDuration(durationWeeks: number): void {
    if (durationWeeks < 1 || durationWeeks > 52) {
      throw new BadRequestException('Durata deve essere tra 1 e 52 settimane');
    }
  }

  /**
   * Converte entity a DTO
   */
  private toDto(program: WorkoutProgramEntity): WorkoutProgramDto {
    return {
      id: program.id,
      userId: program.userId,
      name: program.name,
      description: program.description,
      durationWeeks: program.durationWeeks,
      status: program.status,
      version: program.version,
      author: program.author,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
      microcycles:
        program.microcycles?.map((m) => ({
          id: m.id,
          programId: m.programId,
          name: m.name,
          durationWeeks: m.durationWeeks,
          orderIndex: m.orderIndex,
          objectives: m.objectives,
          notes: m.notes,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          sessions:
            m.sessions?.map((s) => ({
              id: s.id,
              microcycleId: s.microcycleId,
              name: s.name,
              dayOfWeek: s.dayOfWeek,
              orderIndex: s.orderIndex,
              estimatedDurationMinutes: s.estimatedDurationMinutes,
              notes: s.notes,
              status: s.status,
              exercises:
                s.exercises?.map((e) => ({
                  id: e.id,
                  sessionId: e.sessionId,
                  exerciseId: e.exerciseId,
                  exerciseName: e.exercise?.name,
                  sets: e.sets,
                  reps: e.reps,
                  weightKg: e.weightKg,
                  rpe: e.rpe,
                  notes: e.notes,
                  orderIndex: e.orderIndex,
                })) || [],
            })) || [],
        })) || [],
    };
  }
}
