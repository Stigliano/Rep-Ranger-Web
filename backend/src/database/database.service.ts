import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Servizio per operazioni database di base
 * Fornisce metodi per health check e diagnostica
 */
@Injectable()
export class DatabaseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Verifica connessione database
   * @returns true se connesso, false altrimenti
   */
  async isConnected(): Promise<boolean> {
    return this.dataSource.isInitialized;
  }

  /**
   * Esegue query semplice per test connessione
   * @returns true se query riuscita
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Ottiene informazioni database
   * @returns Informazioni database
   */
  async getDatabaseInfo(): Promise<{
    connected: boolean;
    database: string;
    driver: string;
  }> {
    return {
      connected: this.dataSource.isInitialized,
      database: this.dataSource.options.database as string,
      driver: this.dataSource.options.type,
    };
  }
}
