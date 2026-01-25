import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BodyProgressPhoto } from './body-progress-photo.entity';
import { User } from './user.entity';

@Entity('body_tracking_sessions')
export class BodyTrackingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column('float', { nullable: true })
  weight: number;

  @Column('text', { nullable: true })
  notes: string;

  @OneToMany(() => BodyProgressPhoto, photo => photo.session, { cascade: true })
  photos: BodyProgressPhoto[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
