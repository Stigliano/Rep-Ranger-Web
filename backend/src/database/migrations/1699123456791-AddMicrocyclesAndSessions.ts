import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
  TableCheck,
} from 'typeorm';

/**
 * Migrazione per aggiungere tabelle microcycles e workout_sessions
 * Conforme a 5_DB_ARCHITECTURE.md sezioni 3.2.2 e 3.2.3
 */
export class AddMicrocyclesAndSessions1699123456791 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabella microcycles
    await queryRunner.createTable(
      new Table({
        name: 'microcycles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'program_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'duration_weeks',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'order_index',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'objectives',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // CHECK constraint per duration_weeks
    await queryRunner.createCheckConstraint(
      'microcycles',
      new TableCheck({
        name: 'CHK_microcycles_duration_weeks',
        expression: '"duration_weeks" >= 1 AND "duration_weeks" <= 4',
      }),
    );

    // Foreign key microcycles -> workout_programs
    await queryRunner.createForeignKey(
      'microcycles',
      new TableForeignKey({
        columnNames: ['program_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workout_programs',
        onDelete: 'CASCADE',
      }),
    );

    // Indici microcycles
    await queryRunner.createIndex(
      'microcycles',
      new TableIndex({
        name: 'idx_microcycles_program_id',
        columnNames: ['program_id'],
      }),
    );

    await queryRunner.createIndex(
      'microcycles',
      new TableIndex({
        name: 'idx_microcycles_program_order',
        columnNames: ['program_id', 'order_index'],
        isUnique: true,
      }),
    );

    // Tabella workout_sessions
    await queryRunner.createTable(
      new Table({
        name: 'workout_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'microcycle_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'day_of_week',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'order_index',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'estimated_duration_minutes',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'exercise_ids',
            type: 'jsonb',
            default: "'[]'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'scheduled'",
            isNullable: false,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // CHECK constraint per day_of_week
    await queryRunner.createCheckConstraint(
      'workout_sessions',
      new TableCheck({
        name: 'CHK_workout_sessions_day_of_week',
        expression: '"day_of_week" >= 1 AND "day_of_week" <= 7',
      }),
    );

    // CHECK constraint per status
    await queryRunner.createCheckConstraint(
      'workout_sessions',
      new TableCheck({
        name: 'CHK_workout_sessions_status',
        expression: `"status" IN ('scheduled', 'in_progress', 'paused', 'completed', 'skipped', 'archived')`,
      }),
    );

    // Foreign key workout_sessions -> microcycles
    await queryRunner.createForeignKey(
      'workout_sessions',
      new TableForeignKey({
        columnNames: ['microcycle_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'microcycles',
        onDelete: 'CASCADE',
      }),
    );

    // Indici workout_sessions
    await queryRunner.createIndex(
      'workout_sessions',
      new TableIndex({
        name: 'idx_workout_sessions_microcycle_id',
        columnNames: ['microcycle_id'],
      }),
    );

    await queryRunner.createIndex(
      'workout_sessions',
      new TableIndex({
        name: 'idx_workout_sessions_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'workout_sessions',
      new TableIndex({
        name: 'idx_workout_sessions_microcycle_order',
        columnNames: ['microcycle_id', 'order_index'],
      }),
    );

    // Indice GIN su exercise_ids (via SQL raw per compatibilità TypeORM 0.3.17)
    await queryRunner.query(`
      CREATE INDEX idx_workout_sessions_exercise_ids_gin 
      ON workout_sessions 
      USING GIN (exercise_ids)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminazione in ordine inverso (rispettando foreign keys)
    await queryRunner.dropTable('workout_sessions', true);
    await queryRunner.dropTable('microcycles', true);
  }
}
