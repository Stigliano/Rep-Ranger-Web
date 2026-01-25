import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableColumn } from "typeorm";

export class CreateBodyTrackingSessionsAndLinkPhotos1767600000003 implements MigrationInterface {
    name = 'CreateBodyTrackingSessionsAndLinkPhotos1767600000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create body_tracking_sessions table
        await queryRunner.createTable(new Table({
            name: "body_tracking_sessions",
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
                    name: "date",
                    type: "timestamp",
                    isNullable: false
                },
                {
                    name: "weight",
                    type: "float",
                    isNullable: true
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

        // Add FK to users table for body_tracking_sessions
        await queryRunner.createForeignKey("body_tracking_sessions", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        // Add Index on user_id for body_tracking_sessions
        await queryRunner.createIndex("body_tracking_sessions", new TableIndex({
            name: "IDX_body_tracking_sessions_user_id",
            columnNames: ["user_id"]
        }));

        // 2. Add session_id to body_progress_photos
        // Check if column exists first to be safe, though likely not based on report
        const table = await queryRunner.getTable("body_progress_photos");
        const sessionColumn = table?.findColumnByName("session_id");
        
        if (!sessionColumn) {
            await queryRunner.addColumn("body_progress_photos", new TableColumn({
                name: "session_id",
                type: "uuid",
                isNullable: true
            }));

            // Add FK to body_tracking_sessions
            await queryRunner.createForeignKey("body_progress_photos", new TableForeignKey({
                columnNames: ["session_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "body_tracking_sessions",
                onDelete: "CASCADE" // If session is deleted, photos might want to be kept or deleted? 
                                    // Entity says: @ManyToOne(() => BodyTrackingSession, session => session.photos, { onDelete: 'CASCADE', nullable: true })
                                    // But usually photos are children of session. Let's stick to CASCADE as per entity definition if implied, 
                                    // actually the entity definition `onDelete: 'CASCADE'` on the ManyToOne side usually means "if the related entity (session) is deleted, delete this entity (photo)".
                                    // Wait, `onDelete: 'CASCADE'` in TypeORM ManyToOne means "database ON DELETE CASCADE".
                                    // So yes, if session is deleted, photo is deleted.
            }));

            // Add Index for session_id
            await queryRunner.createIndex("body_progress_photos", new TableIndex({
                name: "IDX_body_progress_photos_session_id",
                columnNames: ["session_id"]
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("body_progress_photos");
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("session_id") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("body_progress_photos", foreignKey);
        }
        
        const index = table?.indices.find(idx => idx.columnNames.indexOf("session_id") !== -1);
        if (index) {
            await queryRunner.dropIndex("body_progress_photos", index);
        }

        await queryRunner.dropColumn("body_progress_photos", "session_id");

        const sessionTable = await queryRunner.getTable("body_tracking_sessions");
        const userForeignKey = sessionTable?.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);
        if (userForeignKey) {
            await queryRunner.dropForeignKey("body_tracking_sessions", userForeignKey);
        }

        await queryRunner.dropTable("body_tracking_sessions");
    }
}
