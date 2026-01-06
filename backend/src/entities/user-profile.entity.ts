import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { UserEntity } from './user.entity';

/**
 * Entità UserProfile - Profilo utente con informazioni personali e atleta
 * Conforme a 5_DB_ARCHITECTURE.md sezione 3.1.2
 */
@Entity('user_profiles')
@Check(`"gender" IN ('male', 'female', 'other') OR "gender" IS NULL`)
@Check(
  `"athlete_level" IN ('beginner', 'intermediate', 'advanced', 'competitive') OR "athlete_level" IS NULL`,
)
export class UserProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer', nullable: true })
  age: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  gender: 'male' | 'female' | 'other' | null;

  @Column({ type: 'integer', nullable: true, name: 'height_cm' })
  heightCm: number | null;

  @Column({ type: 'text', nullable: true, name: 'photo_uri' })
  photoUri: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'athlete_level',
  })
  athleteLevel: 'beginner' | 'intermediate' | 'advanced' | 'competitive' | null;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true, name: 'weekly_volume_hours' })
  weeklyVolumeHours: number | null;

  @Column({ type: 'jsonb', nullable: true, name: 'training_focus' })
  trainingFocus: string[] | null;

  @Column({ type: 'jsonb', nullable: true, name: 'training_locations' })
  trainingLocations: string[] | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'meals_per_day' })
  mealsPerDay: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'meal_timing' })
  mealTiming: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'macro_tracking' })
  macroTracking: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  supplements: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'training_log' })
  trainingLog: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'heart_rate_monitoring' })
  heartRateMonitoring: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relazione
  @OneToOne(() => UserEntity, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;
}
