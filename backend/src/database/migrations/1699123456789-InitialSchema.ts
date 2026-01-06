import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migrazione iniziale - Crea schema base database
 * Conforme a 5_DB_ARCHITECTURE.md
 */
export class InitialSchema1699123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabella users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'email_verification_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email_verification_expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'password_reset_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'password_reset_expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_login_at',
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

    // Indici users
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email_verification_token',
        columnNames: ['email_verification_token'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_password_reset_token',
        columnNames: ['password_reset_token'],
      }),
    );

    // Tabella user_profiles
    await queryRunner.createTable(
      new Table({
        name: 'user_profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'age',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'height_cm',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'photo_uri',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'athlete_level',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'weekly_volume_hours',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'training_focus',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'training_locations',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'meals_per_day',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'meal_timing',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'macro_tracking',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'supplements',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'training_log',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'heart_rate_monitoring',
            type: 'varchar',
            length: '50',
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

    // Foreign key user_profiles -> users
    await queryRunner.createForeignKey(
      'user_profiles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indice user_profiles
    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_user_id',
        columnNames: ['user_id'],
      }),
    );

    // Tabella user_settings
    await queryRunner.createTable(
      new Table({
        name: 'user_settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'language',
            type: 'varchar',
            length: '10',
            default: "'it'",
          },
          {
            name: 'units',
            type: 'varchar',
            length: '20',
            default: "'metric'",
          },
          {
            name: 'feature_level',
            type: 'varchar',
            length: '20',
            default: "'advanced'",
          },
          {
            name: 'haptic_feedback',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sound_feedback',
            type: 'boolean',
            default: true,
          },
          {
            name: 'auto_sync',
            type: 'boolean',
            default: true,
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

    // Foreign key user_settings -> users
    await queryRunner.createForeignKey(
      'user_settings',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indice user_settings
    await queryRunner.createIndex(
      'user_settings',
      new TableIndex({
        name: 'idx_user_settings_user_id',
        columnNames: ['user_id'],
      }),
    );

    // Tabella workout_programs
    await queryRunner.createTable(
      new Table({
        name: 'workout_programs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
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
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'duration_weeks',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'draft'",
            isNullable: false,
          },
          {
            name: 'version',
            type: 'integer',
            default: 1,
            isNullable: false,
          },
          {
            name: 'author',
            type: 'varchar',
            length: '255',
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

    // Foreign key workout_programs -> users
    await queryRunner.createForeignKey(
      'workout_programs',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indici workout_programs
    await queryRunner.createIndex(
      'workout_programs',
      new TableIndex({
        name: 'idx_workout_programs_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'workout_programs',
      new TableIndex({
        name: 'idx_workout_programs_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'workout_programs',
      new TableIndex({
        name: 'idx_workout_programs_user_status',
        columnNames: ['user_id', 'status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminazione in ordine inverso (rispettando foreign keys)
    await queryRunner.dropTable('workout_programs', true);
    await queryRunner.dropTable('user_settings', true);
    await queryRunner.dropTable('user_profiles', true);
    await queryRunner.dropTable('users', true);
  }
}
