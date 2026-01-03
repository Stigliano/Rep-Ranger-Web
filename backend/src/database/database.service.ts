import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

/**
 * Servizio per operazioni database di base
 * Fornisce metodi per health check e diagnostica
 */
@Injectable()
export class DatabaseService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  /**
   * Verifica connessione database
   * @returns true se connesso, false altrimenti
   */
  async isConnected(): Promise<boolean> {
    try {
      return this.connection.isConnected;
    } catch (error) {
      return false;
    }
  }

  /**
   * Esegue query semplice per test connessione
   * @returns true se query riuscita
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.connection.query('SELECT 1');
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
      connected: this.connection.isConnected,
      database: this.connection.options.database as string,
      driver: this.connection.options.type,
    };
  }
}

