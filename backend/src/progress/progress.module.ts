import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { WorkoutLogEntity } from '../entities/workout-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutLogEntity])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
