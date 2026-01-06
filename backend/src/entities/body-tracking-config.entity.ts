import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('body_tracking_config')
export class BodyTrackingConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'target_method', length: 50, default: 'casey_butt' })
  targetMethod: string;

  @Column('jsonb', { name: 'custom_targets', default: {} })
  customTargets: Record<string, number>;

  @Column('jsonb', { name: 'display_preferences', default: {} })
  displayPreferences: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

