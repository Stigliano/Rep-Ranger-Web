import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingLogService } from './training-log.service';
import { TrainingLogController } from './training-log.controller';
import { WorkoutLogEntity } from '../entities/workout-log.entity';
import { WorkoutLogExerciseEntity } from '../entities/workout-log-exercise.entity';
import { WorkoutLogSetEntity } from '../entities/workout-log-set.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutLogEntity, WorkoutLogExerciseEntity, WorkoutLogSetEntity]),
  ],
  controllers: [TrainingLogController],
  providers: [TrainingLogService],
  exports: [TrainingLogService],
})
export class TrainingLogModule {}
