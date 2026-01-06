import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBodyTrackingConfigTable1767600000001 implements MigrationInterface {
    name = 'CreateBodyTrackingConfigTable1767600000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "body_tracking_config" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "user_id" uuid NOT NULL,
                "target_method" character varying(50) NOT NULL DEFAULT 'casey_butt',
                "custom_targets" jsonb DEFAULT '{}',
                "display_preferences" jsonb DEFAULT '{}',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_body_tracking_config_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_body_tracking_config_user_id" UNIQUE ("user_id"),
                CONSTRAINT "FK_body_tracking_config_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "chk_target_method" CHECK (target_method IN ('casey_butt', 'golden_ratio'))
            )
        `);

        await queryRunner.query(`CREATE INDEX "idx_body_tracking_config_user_id" ON "body_tracking_config" ("user_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_body_tracking_config_user_id"`);
        await queryRunner.query(`DROP TABLE "body_tracking_config"`);
    }
}

