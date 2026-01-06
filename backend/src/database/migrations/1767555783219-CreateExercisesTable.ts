import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExercisesTable1767555783219 implements MigrationInterface {
  name = 'CreateExercisesTable1767555783219';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Enums
    await queryRunner.query(
      `CREATE TYPE "public"."exercises_musclegroup_enum" AS ENUM('CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'FULL_BODY', 'CARDIO', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exercises_equipment_enum" AS ENUM('BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'OTHER')`,
    );

    // Create Exercises Table
    await queryRunner.query(
      `CREATE TABLE "exercises" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "muscleGroup" "public"."exercises_musclegroup_enum" NOT NULL DEFAULT 'OTHER', "equipment" "public"."exercises_equipment_enum" NOT NULL DEFAULT 'OTHER', "videoUrl" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a521b5cac5648eedc036e17d1bd" UNIQUE ("name"), CONSTRAINT "PK_c4c46f5fa89a58ba7c2d894e3c3" PRIMARY KEY ("id"))`,
    );

    // Create Workout Exercises Table
    await queryRunner.query(
      `CREATE TABLE "workout_exercises" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid NOT NULL, "exercise_id" character varying(255) NOT NULL, "sets" integer NOT NULL, "reps" integer NOT NULL, "weight_kg" numeric(5,2) NOT NULL, "rpe" numeric(3,1), "notes" text, "order_index" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_9fd631c7387dc4160c9b1e2186" CHECK ("weight_kg" >= 0 AND "weight_kg" <= 500), CONSTRAINT "CHK_3f58ddce8eeb66904c8692b84b" CHECK ("reps" >= 1 AND "reps" <= 100), CONSTRAINT "CHK_52eb2fa38dd09b02d05c1656ae" CHECK ("sets" >= 1 AND "sets" <= 20), CONSTRAINT "PK_377f9ead6fd69b29f0d0feb1028" PRIMARY KEY ("id"))`,
    );

    // Indexes for Workout Exercises
    await queryRunner.query(
      `CREATE INDEX "IDX_53ee5ec1dc0257ccd890f0cad5" ON "workout_exercises" ("session_id", "order_index") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b44266dce5b629ff190a9b09e" ON "workout_exercises" ("session_id") `,
    );

    // Foreign Keys for Workout Exercises
    await queryRunner.query(
      `ALTER TABLE "workout_exercises" ADD CONSTRAINT "FK_3b44266dce5b629ff190a9b09e3" FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workout_exercises" DROP CONSTRAINT "FK_3b44266dce5b629ff190a9b09e3"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_3b44266dce5b629ff190a9b09e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_53ee5ec1dc0257ccd890f0cad5"`);
    await queryRunner.query(`DROP TABLE "workout_exercises"`);
    await queryRunner.query(`DROP TABLE "exercises"`);
    await queryRunner.query(`DROP TYPE "public"."exercises_equipment_enum"`);
    await queryRunner.query(`DROP TYPE "public"."exercises_musclegroup_enum"`);
  }
}
