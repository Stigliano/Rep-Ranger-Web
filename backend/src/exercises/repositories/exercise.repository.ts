import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ExerciseEntity, MuscleGroup, Equipment } from '../../entities/exercise.entity';

@Injectable()
export class ExerciseRepository {
  constructor(
    @InjectRepository(ExerciseEntity)
    private readonly repository: Repository<ExerciseEntity>,
  ) {}

  async findAll(
    muscleGroup?: MuscleGroup,
    equipment?: Equipment,
    search?: string,
  ): Promise<ExerciseEntity[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (muscleGroup) {
      where.muscleGroup = muscleGroup;
    }
    if (equipment) {
      where.equipment = equipment;
    }
    if (search) {
      where.name = ILike(`%${search}%`);
    }

    return this.repository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<ExerciseEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<ExerciseEntity | null> {
    return this.repository.findOne({ where: { name } });
  }

  async create(data: Partial<ExerciseEntity>): Promise<ExerciseEntity> {
    const exercise = this.repository.create(data);
    return this.repository.save(exercise);
  }

  async update(id: string, data: Partial<ExerciseEntity>): Promise<ExerciseEntity> {
    await this.repository.update(id, data);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error('Esercizio non trovato dopo aggiornamento');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error('Esercizio non trovato');
    }
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
