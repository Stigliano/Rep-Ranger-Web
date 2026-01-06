import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { WorkoutLogExerciseEntity } from './workout-log-exercise.entity';

@Entity('workout_log_sets')
@Index(['workoutLogExerciseId'])
export class WorkoutLogSetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'workout_log_exercise_id' })
  workoutLogExerciseId: string;

  @Column({ type: 'integer', name: 'set_number' })
  setNumber: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number | null;

  @Column({ type: 'integer', nullable: true })
  reps: number | null;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rpe: number | null;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => WorkoutLogExerciseEntity, (exercise) => exercise.sets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workout_log_exercise_id' })
  workoutLogExercise: WorkoutLogExerciseEntity;
}
