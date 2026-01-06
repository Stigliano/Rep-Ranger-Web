import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainingLogTables1767561366150 implements MigrationInterface {
  name = 'CreateTrainingLogTables1767561366150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "workout_log_sets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workout_log_exercise_id" uuid NOT NULL, "set_number" integer NOT NULL, "weight" numeric(5,2), "reps" integer, "rpe" numeric(3,1), "completed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7bf3c8d8c596a90c68aa1c53e00" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bcd4c62263540dff22825df60f" ON "workout_log_sets" ("workout_log_exercise_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "workout_log_exercises" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workout_log_id" uuid NOT NULL, "exercise_id" uuid NOT NULL, "order_index" integer NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cae817c1e7d7532fc31eb80398e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_50adf93d9f400911b8be61c53b" ON "workout_log_exercises" ("workout_log_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "workout_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "session_id" uuid, "date" TIMESTAMP NOT NULL, "duration_minutes" integer, "rpe" integer, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_53a1e174f32d705c6471f3ae7fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b814dca09ebf1ff2f5d256e85e" ON "workout_logs" ("date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_630a1e35bc6daf57bf3f34e5ea" ON "workout_logs" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_log_sets" ADD CONSTRAINT "FK_bcd4c62263540dff22825df60f5" FOREIGN KEY ("workout_log_exercise_id") REFERENCES "workout_log_exercises"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_log_exercises" ADD CONSTRAINT "FK_50adf93d9f400911b8be61c53b9" FOREIGN KEY ("workout_log_id") REFERENCES "workout_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_log_exercises" ADD CONSTRAINT "FK_e5e8d1460c2936da8796c6cc20c" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_logs" ADD CONSTRAINT "FK_630a1e35bc6daf57bf3f34e5eab" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_logs" ADD CONSTRAINT "FK_6d3ff7aaec266d0ba2c9a49a1fa" FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workout_logs" DROP CONSTRAINT "FK_6d3ff7aaec266d0ba2c9a49a1fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_logs" DROP CONSTRAINT "FK_630a1e35bc6daf57bf3f34e5eab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_log_exercises" DROP CONSTRAINT "FK_e5e8d1460c2936da8796c6cc20c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_log_exercises" DROP CONSTRAINT "FK_50adf93d9f400911b8be61c53b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_log_sets" DROP CONSTRAINT "FK_bcd4c62263540dff22825df60f5"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_630a1e35bc6daf57bf3f34e5ea"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b814dca09ebf1ff2f5d256e85e"`);
    await queryRunner.query(`DROP TABLE "workout_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_50adf93d9f400911b8be61c53b"`);
    await queryRunner.query(`DROP TABLE "workout_log_exercises"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bcd4c62263540dff22825df60f"`);
    await queryRunner.query(`DROP TABLE "workout_log_sets"`);
  }
}
