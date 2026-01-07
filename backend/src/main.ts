import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Global prefix per API
    app.setGlobalPrefix('api');

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
    await app.listen(port);

    console.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
