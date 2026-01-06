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
  Check,
} from 'typeorm';
import { MicrocycleEntity } from './microcycle.entity';
import { WorkoutExerciseEntity } from './workout-exercise.entity';

/**
 * SessionStatus enum
 */
export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  ARCHIVED = 'archived',
}

/**
 * Entità WorkoutSession - Sessioni di allenamento all'interno di microcicli
 * Conforme a 5_DB_ARCHITECTURE.md sezione 3.2.3
 */
@Entity('workout_sessions')
@Index(['microcycleId'])
@Index(['status'])
@Index(['microcycleId', 'orderIndex'])
@Check(`"day_of_week" >= 1 AND "day_of_week" <= 7`)
@Check(`"status" IN ('scheduled', 'in_progress', 'paused', 'completed', 'skipped', 'archived')`)
export class WorkoutSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'microcycle_id' })
  microcycleId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'integer',
    name: 'day_of_week',
  })
  dayOfWeek: number;

  @Column({ type: 'integer', name: 'order_index' })
  orderIndex: number;

  @Column({ type: 'integer', nullable: true, name: 'estimated_duration_minutes' })
  estimatedDurationMinutes: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'", name: 'exercise_ids' })
  exerciseIds: string[];

  @Column({
    type: 'varchar',
    length: 20,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'started_at' })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relazione
  @ManyToOne(() => MicrocycleEntity, (microcycle) => microcycle.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'microcycle_id', referencedColumnName: 'id' })
  microcycle: MicrocycleEntity;

  @OneToMany(() => WorkoutExerciseEntity, (exercise) => exercise.session, {
    cascade: true,
  })
  exercises: WorkoutExerciseEntity[];
}
