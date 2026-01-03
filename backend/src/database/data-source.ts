import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserSettingsEntity } from '../entities/user-settings.entity';
import { WorkoutProgramEntity } from '../entities/workout-program.entity';
import { MicrocycleEntity } from '../entities/microcycle.entity';
import { WorkoutSessionEntity } from '../entities/workout-session.entity';

/**
 * DataSource per CLI TypeORM (migrazioni)
 * Utilizzato da script npm run migration:*
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
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
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // MAI true in produzione
  logging: process.env.NODE_ENV === 'development',
});

