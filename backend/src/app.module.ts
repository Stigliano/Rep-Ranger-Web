import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { WorkoutProgramModule } from './workout-program/workout-program.module';
import { ExercisesModule } from './exercises/exercises.module';
import { TrainingLogModule } from './training-log/training-log.module';
import { ProgressModule } from './progress/progress.module';
import { validate } from './common/config/env.validation';

@Module({
  imports: [
    // Configurazione globale con validazione
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    // Database module (connessione TypeORM)
    DatabaseModule,
    // Health check module
    HealthModule,
    // Auth module
    AuthModule,
    // Workout Program module
    WorkoutProgramModule,
    // Exercises module
    ExercisesModule,
    // Training Log module
    TrainingLogModule,
    // Progress module
    ProgressModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
