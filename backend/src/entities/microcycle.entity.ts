import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
  Check,
} from 'typeorm';
import { WorkoutProgramEntity } from './workout-program.entity';
import { WorkoutSessionEntity } from './workout-session.entity';

/**
 * Entità Microcycle - Microcicli (1-4 settimane) all'interno di programmi
 * Conforme a 5_DB_ARCHITECTURE.md sezione 3.2.2
 */
@Entity('microcycles')
@Index(['programId'])
@Index(['programId', 'orderIndex'])
@Unique(['programId', 'orderIndex'])
@Check(`"duration_weeks" >= 1 AND "duration_weeks" <= 4`)
export class MicrocycleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'program_id' })
  programId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'integer',
    name: 'duration_weeks',
  })
  durationWeeks: number;

  @Column({ type: 'integer', name: 'order_index' })
  orderIndex: number;

  @Column({ type: 'text', nullable: true })
  objectives: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relazioni
  @ManyToOne(() => WorkoutProgramEntity, (program) => program.microcycles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'program_id', referencedColumnName: 'id' })
  program: WorkoutProgramEntity;

  @OneToMany(() => WorkoutSessionEntity, (session) => session.microcycle, { cascade: true })
  sessions: WorkoutSessionEntity[];
}
