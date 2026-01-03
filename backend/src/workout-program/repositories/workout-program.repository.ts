import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutProgramEntity, ProgramStatus } from '../../entities/workout-program.entity';

/**
 * Repository per WorkoutProgram
 * Gestisce accesso dati per programmi di allenamento
 */
@Injectable()
export class WorkoutProgramRepository {
  constructor(
    @InjectRepository(WorkoutProgramEntity)
    private readonly repository: Repository<WorkoutProgramEntity>,
  ) {}

  /**
   * Trova tutti i programmi di un utente
   */
  async findByUserId(userId: string): Promise<WorkoutProgramEntity[]> {
    return this.repository.find({
      where: { userId },
      relations: ['microcycles', 'microcycles.sessions'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Trova programma per ID e userId
   */
  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<WorkoutProgramEntity | null> {
    return this.repository.findOne({
      where: { id, userId },
      relations: ['microcycles', 'microcycles.sessions'],
    });
  }

  /**
   * Crea nuovo programma
   */
  async create(
    data: Partial<WorkoutProgramEntity>,
  ): Promise<WorkoutProgramEntity> {
    const program = this.repository.create(data);
    return this.repository.save(program);
  }

  /**
   * Aggiorna programma
   */
  async update(
    id: string,
    data: Partial<WorkoutProgramEntity>,
  ): Promise<WorkoutProgramEntity> {
    await this.repository.update(id, data);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error('Programma non trovato dopo aggiornamento');
    }
    return updated;
  }

  /**
   * Elimina programma
   */
  async delete(id: string, userId: string): Promise<void> {
    const result = await this.repository.delete({ id, userId });
    if (result.affected === 0) {
      throw new Error('Programma non trovato o non autorizzato');
    }
  }

  /**
   * Trova programmi per status
   */
  async findByStatus(
    userId: string,
    status: ProgramStatus,
  ): Promise<WorkoutProgramEntity[]> {
    return this.repository.find({
      where: { userId, status },
      order: { createdAt: 'DESC' },
    });
  }
}

