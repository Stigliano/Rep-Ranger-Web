import { IsString, IsNumber, IsDateString, IsIn, IsOptional, Min, Max } from 'class-validator';
import { VALID_METRIC_TYPES } from '../constants/metric-types.constant';

export class CreateBodyMetricDto {
  @IsString()
  @IsIn(VALID_METRIC_TYPES)
  metricType: string;

  @IsNumber()
  @Min(0)
  @Max(500)
  value: number;

  @IsString()
  @IsIn(['kg', 'lbs', 'cm', 'inches', 'mm']) // Added mm for skinfolds
  unit: string;

  @IsDateString()
  measuredAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
