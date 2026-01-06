import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixExerciseIdType1767562228120 implements MigrationInterface {
  name = 'FixExerciseIdType1767562228120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "workout_exercises"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_profiles_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_settings_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_email_verification_token"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_password_reset_token"`);
    await queryRunner.query(`DROP INDEX "public"."idx_workout_sessions_microcycle_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_workout_sessions_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_workout_sessions_microcycle_order"`);
    await queryRunner.query(`DROP INDEX "public"."idx_workout_sessions_exercise_ids_gin"`);
    await queryRunner.query(`DROP INDEX "public"."idx_microcycles_program_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_microcycles_program_order"`);
    await queryRunner.query(`DROP INDEX "public"."idx_workout_programs_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_workout_programs_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_workout_programs_user_status"`);
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" DROP CONSTRAINT "CHK_workout_sessions_day_of_week"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" DROP CONSTRAINT "CHK_workout_sessions_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "microcycles" DROP CONSTRAINT "CHK_microcycles_duration_weeks"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "workout_exercises" DROP COLUMN "exercise_id"`);
    await queryRunner.query(`ALTER TABLE "workout_exercises" ADD "exercise_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "microcycles" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "microcycles" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_programs" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_programs" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff9a3703202de50da99dcf1602" ON "workout_sessions" ("microcycle_id", "order_index") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac620b163a93d66b4282a4e34c" ON "workout_sessions" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3821000426ac144c64b81aa31" ON "workout_sessions" ("microcycle_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ebf17d640d5dc4cbea2d1dfad2" ON "microcycles" ("program_id", "order_index") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_949a8a315ee333dae5b0025e79" ON "microcycles" ("program_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3efb89d53c09d698ed8c8e6b81" ON "workout_programs" ("user_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f8ae5aa617437f1fb4ce74ee1b" ON "workout_programs" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_424816a6b10008fdae2618a141" ON "workout_programs" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "CHK_15c59306f27e0a547b71062770" CHECK ("athlete_level" IN ('beginner', 'intermediate', 'advanced', 'competitive') OR "athlete_level" IS NULL)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "CHK_1f79c1a619a80767673dc9d6d7" CHECK ("gender" IN ('male', 'female', 'other') OR "gender" IS NULL)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "CHK_3e7d1861d859ac8bd6d50efa31" CHECK ("feature_level" IN ('basic', 'advanced'))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "CHK_d94b08c5780b03710ed6fa6580" CHECK ("units" IN ('metric', 'imperial'))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "CHK_b7baf4395b162953987e367487" CHECK ("language" IN ('it', 'en'))`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" ADD CONSTRAINT "CHK_a3fb85c222321504f81a446a60" CHECK ("status" IN ('scheduled', 'in_progress', 'paused', 'completed', 'skipped', 'archived'))`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" ADD CONSTRAINT "CHK_6f8b302efc4feb4d7fc3520011" CHECK ("day_of_week" >= 1 AND "day_of_week" <= 7)`,
    );
    await queryRunner.query(
      `ALTER TABLE "microcycles" ADD CONSTRAINT "CHK_6340576e792dd32e93bda347ed" CHECK ("duration_weeks" >= 1 AND "duration_weeks" <= 4)`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_programs" ADD CONSTRAINT "CHK_0cc3a8800749576219f71b62a7" CHECK ("status" IN ('draft', 'active', 'paused', 'completed', 'archived'))`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_programs" ADD CONSTRAINT "CHK_021884b8f707e6205f790cdf2f" CHECK ("duration_weeks" >= 1 AND "duration_weeks" <= 52)`,
    );
    await queryRunner.query(
      `ALTER TABLE "microcycles" ADD CONSTRAINT "UQ_ebf17d640d5dc4cbea2d1dfad28" UNIQUE ("program_id", "order_index")`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_exercises" ADD CONSTRAINT "FK_9a0656f321d9a96de2eb685e85a" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workout_exercises" DROP CONSTRAINT "FK_9a0656f321d9a96de2eb685e85a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "microcycles" DROP CONSTRAINT "UQ_ebf17d640d5dc4cbea2d1dfad28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_programs" DROP CONSTRAINT "CHK_021884b8f707e6205f790cdf2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_programs" DROP CONSTRAINT "CHK_0cc3a8800749576219f71b62a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "microcycles" DROP CONSTRAINT "CHK_6340576e792dd32e93bda347ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" DROP CONSTRAINT "CHK_6f8b302efc4feb4d7fc3520011"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" DROP CONSTRAINT "CHK_a3fb85c222321504f81a446a60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "CHK_b7baf4395b162953987e367487"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "CHK_d94b08c5780b03710ed6fa6580"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "CHK_3e7d1861d859ac8bd6d50efa31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "CHK_1f79c1a619a80767673dc9d6d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "CHK_15c59306f27e0a547b71062770"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_424816a6b10008fdae2618a141"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f8ae5aa617437f1fb4ce74ee1b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3efb89d53c09d698ed8c8e6b81"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_949a8a315ee333dae5b0025e79"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ebf17d640d5dc4cbea2d1dfad2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b3821000426ac144c64b81aa31"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ac620b163a93d66b4282a4e34c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ff9a3703202de50da99dcf1602"`);
    await queryRunner.query(
      `ALTER TABLE "workout_programs" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_programs" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "microcycles" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "microcycles" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "workout_exercises" DROP COLUMN "exercise_id"`);
    await queryRunner.query(
      `ALTER TABLE "workout_exercises" ADD "exercise_id" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "microcycles" ADD CONSTRAINT "CHK_microcycles_duration_weeks" CHECK (((duration_weeks >= 1) AND (duration_weeks <= 4)))`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" ADD CONSTRAINT "CHK_workout_sessions_status" CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'in_progress'::character varying, 'paused'::character varying, 'completed'::character varying, 'skipped'::character varying, 'archived'::character varying])::text[])))`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout_sessions" ADD CONSTRAINT "CHK_workout_sessions_day_of_week" CHECK (((day_of_week >= 1) AND (day_of_week <= 7)))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_workout_programs_user_status" ON "workout_programs" ("user_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_workout_programs_status" ON "workout_programs" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_workout_programs_user_id" ON "workout_programs" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_microcycles_program_order" ON "microcycles" ("program_id", "order_index") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_microcycles_program_id" ON "microcycles" ("program_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_workout_sessions_exercise_ids_gin" ON "workout_sessions" ("exercise_ids") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_workout_sessions_microcycle_order" ON "workout_sessions" ("microcycle_id", "order_index") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_workout_sessions_status" ON "workout_sessions" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_workout_sessions_microcycle_id" ON "workout_sessions" ("microcycle_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_password_reset_token" ON "users" ("password_reset_token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_email_verification_token" ON "users" ("email_verification_token") `,
    );
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users" ("email") `);
    await queryRunner.query(
      `CREATE INDEX "idx_user_settings_user_id" ON "user_settings" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_profiles_user_id" ON "user_profiles" ("user_id") `,
    );
  }
}
