import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

/**
 * Migrazione per aggiungere indici mancanti
 */
export class AddIndexes1699123456790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Indici già creati nella migrazione iniziale, questa è un placeholder
    // per future ottimizzazioni se necessario
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback non necessario per questa migrazione
  }
}

