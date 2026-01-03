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
} from 'typeorm';
import { UserEntity } from './user.entity';
import { MicrocycleEntity } from './microcycle.entity';

/**
 * ProgramStatus enum
 */
export enum ProgramStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

/**
 * Entità WorkoutProgram - Programmi di allenamento completi
 * Conforme a 5_DB_ARCHITECTURE.md sezione 3.2.1
 */
@Entity('workout_programs')
@Index(['userId'])
@Index(['status'])
@Index(['userId', 'status'])
export class WorkoutProgramEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'integer',
    name: 'duration_weeks',
    check: 'duration_weeks >= 1 AND duration_weeks <= 52',
  })
  durationWeeks: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: ProgramStatus.DRAFT,
    check: "status IN ('draft', 'active', 'paused', 'completed', 'archived')",
  })
  status: ProgramStatus;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relazioni
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @OneToMany(() => MicrocycleEntity, (microcycle) => microcycle.program, { cascade: true })
  microcycles: MicrocycleEntity[];
}

