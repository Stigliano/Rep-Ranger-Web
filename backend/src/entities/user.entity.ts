import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserProfileEntity } from './user-profile.entity';
import { UserSettingsEntity } from './user-settings.entity';

/**
 * Entità User - Tabella principale utenti per autenticazione
 * Conforme a 5_DB_ARCHITECTURE.md sezione 3.1.1
 */
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'email_verification_token' })
  emailVerificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'email_verification_expires_at' })
  emailVerificationExpiresAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_reset_token' })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'password_reset_expires_at' })
  passwordResetExpiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relazioni
  @OneToOne(() => UserProfileEntity, (profile) => profile.user, { cascade: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'userId' })
  profile: UserProfileEntity;

  @OneToOne(() => UserSettingsEntity, (settings) => settings.user, { cascade: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'userId' })
  settings: UserSettingsEntity;
}

export { UserEntity as User };
