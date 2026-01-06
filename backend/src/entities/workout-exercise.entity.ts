import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { WorkoutSessionEntity } from './workout-session.entity';
import { ExerciseEntity } from './exercise.entity';

/**
 * Entità WorkoutExercise - Esercizi all'interno di sessioni pianificate
 */
@Entity('workout_exercises')
@Index(['sessionId'])
@Index(['sessionId', 'orderIndex'])
@Check(`"sets" >= 1 AND "sets" <= 20`)
@Check(`"reps" >= 1 AND "reps" <= 100`)
@Check(`"weight_kg" >= 0 AND "weight_kg" <= 500`)
export class WorkoutExerciseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId: string;

  @Column({ type: 'uuid', name: 'exercise_id' })
  exerciseId: string; // Reference to external exercise DB or internal catalog

  @Column({ type: 'integer' })
  sets: number;

  @Column({ type: 'integer' })
  reps: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'weight_kg' })
  weightKg: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rpe: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'integer', name: 'order_index' })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relazione
  @ManyToOne(() => WorkoutSessionEntity, (session) => session.exercises, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id', referencedColumnName: 'id' })
  session: WorkoutSessionEntity;

  @ManyToOne(() => ExerciseEntity)
  @JoinColumn({ name: 'exercise_id' })
  exercise: ExerciseEntity;
}
