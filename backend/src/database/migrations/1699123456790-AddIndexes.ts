import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migrazione per aggiungere indici mancanti
 */
export class AddIndexes1699123456790 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Indici già creati nella migrazione iniziale, questa è un placeholder
    // per future ottimizzazioni se necessario
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Rollback non necessario per questa migrazione
  }
}
