import { IsString, IsNumber, IsDateString, IsIn, IsOptional, Min, Max } from 'class-validator';

export class CreateBodyMetricDto {
  @IsString()
  @IsIn([
    'weight', 'height',
    'neck', 'shoulders', 'chest', 'waist', 'hips', 
    'bicep', 'forearm', 'wrist', 'thigh', 'calf', 'ankle',
    'head_length', 'neck_length', 'torso_length', 'arm_length', 'leg_length'
  ])
  metricType: string;

  @IsNumber()
  @Min(0)
  @Max(500)
  value: number;

  @IsString()
  @IsIn(['kg', 'lbs', 'cm', 'inches'])
  unit: string;

  @IsDateString()
  measuredAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

