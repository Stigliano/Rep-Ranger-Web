import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { BodyTrackingSession } from './body-tracking-session.entity';

export enum PhotoViewType {
  FRONT = 'FRONT',
  BACK = 'BACK',
  LEFT_SIDE = 'LEFT_SIDE',
  RIGHT_SIDE = 'RIGHT_SIDE'
}

@Entity('body_progress_photos')
export class BodyProgressPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => BodyTrackingSession, session => session.photos, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'session_id' })
  session: BodyTrackingSession;

  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @Column({ name: 'photo_url' })
  photoUrl: string;

  @Column({ name: 'view_type', length: 20 })
  viewType: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
