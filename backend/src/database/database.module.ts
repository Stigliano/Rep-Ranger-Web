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
        
        console.log(`🔧 Database Config: Host=${dbHost}, IsCloudRun=${isCloudRun}, User=${configService.get<string>('DB_USER')}, DB=${configService.get<string>('DB_NAME')}`);

        return {
          type: 'postgres',
          // Se DB_HOST inizia con /cloudsql/, usa Unix socket
          ...(isCloudRun
            ? {
                socketPath: dbHost,
              }
            : {
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 5432),
              }),
          database: configService.get<string>('DB_NAME', 'rapranger'),
          username: configService.get<string>('DB_USER', 'rapranger_app'),
          password: configService.get<string>('DB_PASSWORD'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          synchronize: false, // MAI true in produzione - usa migrazioni
          logging: configService.get<string>('NODE_ENV') === 'development',
          ssl:
            configService.get<string>('NODE_ENV') === 'production' && !isCloudRun
              ? { rejectUnauthorized: false }
              : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
