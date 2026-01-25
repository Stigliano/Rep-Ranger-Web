import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateBodyProgressPhotosTable1767600000002 implements MigrationInterface {
    name = 'CreateBodyProgressPhotosTable1767600000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "body_progress_photos",
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
                    name: "photo_url",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "view_type",
                    type: "varchar",
                    length: "20",
                    isNullable: false
                },
                {
                    name: "date",
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

        await queryRunner.createForeignKey("body_progress_photos", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createIndex("body_progress_photos", new TableIndex({
            name: "IDX_body_progress_photos_user_id",
            columnNames: ["user_id"]
        }));

        await queryRunner.createIndex("body_progress_photos", new TableIndex({
            name: "IDX_body_progress_photos_user_date",
            columnNames: ["user_id", "date"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("body_progress_photos");
    }
}
