import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  console.log('🚀 Starting application bootstrap...');
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
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    });

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
