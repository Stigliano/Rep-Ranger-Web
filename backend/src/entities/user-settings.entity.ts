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
 * Entità UserSettings - Impostazioni applicazione e preferenze utente
 * Conforme a 5_DB_ARCHITECTURE.md sezione 3.1.3
 */
@Entity('user_settings')
@Check(`"language" IN ('it', 'en')`)
@Check(`"units" IN ('metric', 'imperial')`)
@Check(`"feature_level" IN ('basic', 'advanced')`)
export class UserSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'user_id' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'it',
  })
  language: 'it' | 'en';

  @Column({
    type: 'varchar',
    length: 20,
    default: 'metric',
  })
  units: 'metric' | 'imperial';

  @Column({
    type: 'varchar',
    length: 20,
    default: 'advanced',
    name: 'feature_level',
  })
  featureLevel: 'basic' | 'advanced';

  @Column({ type: 'boolean', default: true, name: 'haptic_feedback' })
  hapticFeedback: boolean;

  @Column({ type: 'boolean', default: true, name: 'sound_feedback' })
  soundFeedback: boolean;

  @Column({ type: 'boolean', default: true, name: 'auto_sync' })
  autoSync: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relazione
  @OneToOne(() => UserEntity, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;
}
