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
import { WorkoutLogEntity } from './workout-log.entity';
import { ExerciseEntity } from './exercise.entity';
import { WorkoutLogSetEntity } from './workout-log-set.entity';

@Entity('workout_log_exercises')
@Index(['workoutLogId'])
export class WorkoutLogExerciseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'workout_log_id' })
  workoutLogId: string;

  @Column({ type: 'uuid', name: 'exercise_id' })
  exerciseId: string;

  @Column({ type: 'integer', name: 'order_index' })
  orderIndex: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => WorkoutLogEntity, (log) => log.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_log_id' })
  workoutLog: WorkoutLogEntity;

  @ManyToOne(() => ExerciseEntity)
  @JoinColumn({ name: 'exercise_id' })
  exercise: ExerciseEntity;

  @OneToMany(() => WorkoutLogSetEntity, (set) => set.workoutLogExercise, {
    cascade: true,
  })
  sets: WorkoutLogSetEntity[];
}
