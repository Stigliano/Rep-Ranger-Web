import { IsString, IsIn, IsOptional, IsObject } from 'class-validator';

export class UpdateBodyTrackingConfigDto {
  @IsOptional()
  @IsString()
  @IsIn(['casey_butt', 'golden_ratio'])
  targetMethod?: string;

  @IsOptional()
  @IsObject()
  customTargets?: Record<string, number>;

  @IsOptional()
  @IsObject()
  displayPreferences?: Record<string, any>;
}

