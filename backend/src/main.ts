import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  console.log('🚀 Starting application bootstrap...');
  
  // Log Environment details for debugging
  console.log('----------------------------------------');
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`🔌 PORT: ${process.env.PORT || 3000}`);
  
  // Log DB Connection details (Masked)
  const dbHost = process.env.DB_HOST || 'unknown';
  const isCloudRun = dbHost.startsWith('/cloudsql/');
  console.log(`🗄️  DB_HOST: ${isCloudRun ? 'Cloud SQL Socket' : dbHost}`);
  console.log(`👤 DB_USER: ${process.env.DB_USER || 'unknown'}`);
  console.log('----------------------------------------');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Abilita tutti i log per debug
    });

    // Global prefix per API
    app.setGlobalPrefix('api');

    console.log('✅ NestFactory created');


    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Rimuove proprietà non definite nel DTO
        forbidNonWhitelisted: true, // Lancia errore se ci sono proprietà non whitelisted
        transform: true, // Trasforma automaticamente i tipi
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // CORS configuration
    const frontendUrl = process.env.FRONTEND_URL;
    app.enableCors({
      origin: frontendUrl || '*',
      credentials: !!frontendUrl,
    });

    // IMPORTANTE: Cloud Run inietta la porta via variabile d'ambiente PORT (di solito 8080)
    // Dobbiamo ascoltare su QUELLA porta, non forzare la 3000, altrimenti il health check fallisce.
    const port = process.env.PORT || 3000;
    
    console.log(`🔌 Attempting to listen on port ${port}...`);
    await app.listen(port, '0.0.0.0');

    console.log(`Application is running on: http://0.0.0.0:${port}`);
  } catch (error) {
    console.error('❌ FATAL ERROR during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
