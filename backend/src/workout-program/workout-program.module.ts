import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutProgramController } from './workout-program.controller';
import { WorkoutProgramService } from './workout-program.service';
import { WorkoutProgramRepository } from './repositories/workout-program.repository';
import { WorkoutProgramEntity } from '../entities/workout-program.entity';
import { MicrocycleEntity } from '../entities/microcycle.entity';
import { WorkoutSessionEntity } from '../entities/workout-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutProgramEntity, MicrocycleEntity, WorkoutSessionEntity]),
  ],
  controllers: [WorkoutProgramController],
  providers: [WorkoutProgramService, WorkoutProgramRepository],
  exports: [WorkoutProgramService],
})
export class WorkoutProgramModule {}
