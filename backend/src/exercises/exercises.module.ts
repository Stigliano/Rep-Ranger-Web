import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { ExerciseRepository } from './repositories/exercise.repository';
import { ExerciseEntity } from '../entities/exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseEntity])],
  controllers: [ExercisesController],
  providers: [ExercisesService, ExerciseRepository],
  exports: [ExercisesService],
})
export class ExercisesModule {}
