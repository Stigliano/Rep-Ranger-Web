import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateBodyMetricsTable1767590000000 implements MigrationInterface {
    name = 'CreateBodyMetricsTable1767590000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "body_metrics",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    default: "gen_random_uuid()"
                },
                {
                    name: "user_id",
                    type: "uuid",
                    isNullable: false
                },
                {
                    name: "metric_type",
                    type: "varchar",
                    length: "50",
                    isNullable: false
                },
                {
                    name: "value",
                    type: "decimal",
                    precision: 6,
                    scale: 2,
                    isNullable: false
                },
                {
                    name: "unit",
                    type: "varchar",
                    length: "10",
                    isNullable: false
                },
                {
                    name: "measured_at",
                    type: "timestamp",
                    isNullable: false
                },
                {
                    name: "notes",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        await queryRunner.createForeignKey("body_metrics", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createIndex("body_metrics", new TableIndex({
            name: "IDX_body_metrics_user_id",
            columnNames: ["user_id"]
        }));

        // Aggiungo il constraint iniziale che la migrazione successiva si aspetta di rimuovere
        // Valori ipotizzati basati sulla migrazione successiva: 'weight', 'neck', 'chest', 'waist', 'hips', 'thigh', 'arm'
        await queryRunner.query(`
            ALTER TABLE "body_metrics" ADD CONSTRAINT "body_metrics_metric_type_check" 
            CHECK (metric_type IN ('weight', 'neck', 'chest', 'waist', 'hips', 'thigh', 'arm'))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("body_metrics");
    }
}
