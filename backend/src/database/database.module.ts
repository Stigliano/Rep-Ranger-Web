import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Cloud SQL connection via Unix socket (Cloud Run)
        const dbHost = configService.get<string>('DB_HOST');
        const isCloudRun = dbHost?.startsWith('/cloudsql/');

        console.log(
          `🔧 Database Config: Host=${dbHost}, IsCloudRun=${isCloudRun}, User=${configService.get<string>(
            'DB_USER',
          )}, DB=${configService.get<string>('DB_NAME')}`,
        );

        const commonConfig = {
          type: 'postgres' as const,
          database: configService.get<string>('DB_NAME', 'rapranger'),
          username: configService.get<string>('DB_USER', 'rapranger_app'),
          password: configService.get<string>('DB_PASSWORD'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          synchronize: false, // MAI true in produzione - usa migrazioni
          logging: configService.get<string>('NODE_ENV') === 'development',
          retryAttempts: 5, // Riprova connessione all'avvio
          retryDelay: 3000, // Attendi 3 secondi tra i tentativi
        };

        if (isCloudRun) {
          // Configurazione specifica per Cloud Run / Cloud SQL via Unix Socket
          return {
            ...commonConfig,
            host: dbHost, // Importante: imposta host al socket path
            extra: {
              socketPath: dbHost, // Ridondanza per sicurezza per driver pg
            },
            ssl: false, // Non serve SSL su socket Unix locale
          };
        }

        // Configurazione standard TCP
        return {
          ...commonConfig,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          ssl:
            configService.get<string>('NODE_ENV') === 'production'
              ? { rejectUnauthorized: false }
              : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
