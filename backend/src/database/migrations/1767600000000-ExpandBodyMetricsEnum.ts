import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpandBodyMetricsEnum1767600000000 implements MigrationInterface {
    name = 'ExpandBodyMetricsEnum1767600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing constraint
        await queryRunner.query(`ALTER TABLE "body_metrics" DROP CONSTRAINT IF EXISTS "body_metrics_metric_type_check"`);

        // Add new constraint with expanded values
        await queryRunner.query(`
            ALTER TABLE "body_metrics" ADD CONSTRAINT "body_metrics_metric_type_check" CHECK (metric_type IN (
                'weight', 'height',
                'neck', 'shoulders', 'chest', 'waist', 'hips', 
                'bicep', 'forearm', 'wrist', 'thigh', 'calf', 'ankle',
                'head_length', 'neck_length', 'torso_length', 'arm_length', 'leg_length'
            ))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to original constraint (assuming original values were: weight, neck, chest, waist, hips, thigh, arm)
        // Note: Data loss might occur if new metrics are present when reverting. 
        // In a real scenario, we might want to delete those rows first or handle them.
        await queryRunner.query(`ALTER TABLE "body_metrics" DROP CONSTRAINT IF EXISTS "body_metrics_metric_type_check"`);
        await queryRunner.query(`
            ALTER TABLE "body_metrics" ADD CONSTRAINT "body_metrics_metric_type_check" CHECK (metric_type IN ('weight', 'neck', 'chest', 'waist', 'hips', 'thigh', 'arm'))
        `);
    }
}

