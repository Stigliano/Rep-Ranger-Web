import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global Exception Filter
 * Gestisce tutti gli errori dell'applicazione in modo centralizzato
 * Conforme a 3_SOFTWARE_ARCHITECTURE.md sezione 2.5
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        code = responseObj.code || code;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception.stack,
      );
    }

    // Log error per audit (solo errori critici in produzione)
    if (status >= 500) {
      this.logger.error(
        `Error ${status} on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `Client error ${status} on ${request.method} ${request.url}: ${message}`,
      );
    }

    // Risposta strutturata
    const errorResponse = {
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV === 'development' && exception instanceof Error
        ? { stack: exception.stack }
        : {}),
    };

    response.status(status).json(errorResponse);
  }
}

