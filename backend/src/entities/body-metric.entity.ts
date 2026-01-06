import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('body_metrics')
@Unique(['user', 'metricType', 'measuredAt']) // Note: measuredAt is timestamp, might need date truncation for unique constraint in code or DB
export class BodyMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'metric_type', length: 50 })
  metricType: string;

  @Column('decimal', { precision: 6, scale: 2 })
  value: number;

  @Column({ length: 10 })
  unit: string;

  @Column({ name: 'measured_at' })
  measuredAt: Date;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

