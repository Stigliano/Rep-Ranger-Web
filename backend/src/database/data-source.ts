import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve, join } from 'path';
import { UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserSettingsEntity } from '../entities/user-settings.entity';
import { WorkoutProgramEntity } from '../entities/workout-program.entity';
import { MicrocycleEntity } from '../entities/microcycle.entity';
import { WorkoutSessionEntity } from '../entities/workout-session.entity';
import { WorkoutExerciseEntity } from '../entities/workout-exercise.entity';
import { ExerciseEntity } from '../entities/exercise.entity';
import { WorkoutLogEntity } from '../entities/workout-log.entity';
import { WorkoutLogExerciseEntity } from '../entities/workout-log-exercise.entity';
import { WorkoutLogSetEntity } from '../entities/workout-log-set.entity';
import { BodyMetric } from '../entities/body-metric.entity';
import { BodyTrackingConfig } from '../entities/body-tracking-config.entity';
import { BodyProgressPhoto } from '../entities/body-progress-photo.entity';

/**
 * Carica variabili d'ambiente dal file .env
 * Necessario per CLI TypeORM che non passa attraverso NestJS
 */
dotenv.config({ path: resolve(__dirname, '../../.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const isCloudRun = dbHost.startsWith('/cloudsql/');

console.log(`🔌 DataSource Config: Host=${dbHost}, IsCloudRun=${isCloudRun}`);

const commonOptions: DataSourceOptions = {
  type: 'postgres',
  username: process.env.DB_USER || 'rapranger_app',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rapranger',
  entities: [
    UserEntity,
    UserProfileEntity,
    UserSettingsEntity,
    WorkoutProgramEntity,
    MicrocycleEntity,
    WorkoutSessionEntity,
    WorkoutExerciseEntity,
    ExerciseEntity,
    WorkoutLogEntity,
    WorkoutLogExerciseEntity,
    WorkoutLogSetEntity,
    BodyMetric,
    BodyTrackingConfig,
    BodyProgressPhoto,
  ],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false, // MAI true in produzione
  logging: process.env.NODE_ENV === 'development',
};

let dataSourceOptions: DataSourceOptions;

if (isCloudRun) {
  // Configurazione specifica per Cloud Run / Cloud SQL via Unix Socket
  dataSourceOptions = {
    ...commonOptions,
    host: dbHost, // Importante: imposta host al socket path
    extra: {
      socketPath: dbHost, // Ridondanza per sicurezza per driver pg
    },
    ssl: false, // Non serve SSL su socket Unix locale
  };
} else {
  // Configurazione standard TCP
  dataSourceOptions = {
    ...commonOptions,
    host: dbHost,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  };
}

/**
 * DataSource per CLI TypeORM (migrazioni)
 * Utilizzato da script npm run migration:*
 */
export const AppDataSource = new DataSource(dataSourceOptions);
