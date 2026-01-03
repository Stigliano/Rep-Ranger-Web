import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WorkoutProgramRepository } from './repositories/workout-program.repository';
import { WorkoutProgramEntity, ProgramStatus } from '../entities/workout-program.entity';
import { CreateWorkoutProgramDto } from './dto/create-workout-program.dto';
import { UpdateWorkoutProgramDto } from './dto/update-workout-program.dto';
import { WorkoutProgramDto } from './dto/workout-program.dto';

/**
 * Servizio per gestione programmi di allenamento
 * Contiene logica di business per CRUD programmi
 * Conforme a 3_SOFTWARE_ARCHITECTURE.md sezione 2.2
 */
@Injectable()
export class WorkoutProgramService {
  constructor(
    private readonly workoutProgramRepository: WorkoutProgramRepository,
  ) {}

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
    const program = await this.workoutProgramRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!program) {
      throw new NotFoundException('Programma non trovato');
    }
    return this.toDto(program);
  }

  /**
   * Crea nuovo programma
   */
  async create(
    userId: string,
    createDto: CreateWorkoutProgramDto,
  ): Promise<WorkoutProgramDto> {
    // Validazione business logic
    this.validateProgram(createDto);

    const program = await this.workoutProgramRepository.create({
      ...createDto,
      userId,
      status: ProgramStatus.DRAFT,
      version: 1,
    });

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
    const existing = await this.workoutProgramRepository.findByIdAndUserId(
      id,
      userId,
    );
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
    const program = await this.workoutProgramRepository.findByIdAndUserId(
      id,
      userId,
    );
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
  }

  /**
   * Validazione durata
   */
  private validateDuration(durationWeeks: number): void {
    if (durationWeeks < 1 || durationWeeks > 52) {
      throw new BadRequestException(
        'Durata deve essere tra 1 e 52 settimane',
      );
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
      microcycles: program.microcycles?.map((m) => ({
        id: m.id,
        programId: m.programId,
        name: m.name,
        durationWeeks: m.durationWeeks,
        orderIndex: m.orderIndex,
        objectives: m.objectives,
        notes: m.notes,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })) || [],
    };
  }
}

