import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

/**
 * Controller per health check endpoint
 * Utilizzato da Cloud Run e load balancer per verificare stato applicazione
 */
@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Health check base - verifica che l'applicazione risponda
   * @returns Status OK
   */
  @Get()
  async health() {
    const dbConnected = await this.databaseService.isConnected();
    const dbTest = await this.databaseService.testConnection();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        test: dbTest,
      },
    };
  }

  /**
   * Health check dettagliato - include informazioni sistema
   * @returns Informazioni dettagliate stato sistema
   */
  @Get('detailed')
  async detailedHealth() {
    const dbInfo = await this.databaseService.getDatabaseInfo();
    const dbTest = await this.databaseService.testConnection();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      database: {
        ...dbInfo,
        test: dbTest,
      },
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        unit: 'MB',
      },
    };
  }
}
