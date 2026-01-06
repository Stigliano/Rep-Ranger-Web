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
import { WorkoutSessionEntity } from './workout-session.entity';
import { WorkoutLogExerciseEntity } from './workout-log-exercise.entity';

@Entity('workout_logs')
@Index(['userId'])
@Index(['date'])
export class WorkoutLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'session_id', nullable: true })
  sessionId: string | null; // Can be null if ad-hoc workout

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'integer', name: 'duration_minutes', nullable: true })
  durationMinutes: number | null;

  @Column({ type: 'integer', nullable: true })
  rpe: number | null; // Overall Session RPE

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => WorkoutSessionEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'session_id' })
  session: WorkoutSessionEntity | null;

  @OneToMany(() => WorkoutLogExerciseEntity, (exercise) => exercise.workoutLog, {
    cascade: true,
  })
  exercises: WorkoutLogExerciseEntity[];
}
