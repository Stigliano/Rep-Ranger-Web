import { IsString, IsOptional, IsNumber, Min, Max, IsEnum, IsArray, Length } from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum AthleteLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  COMPETITIVE = 'competitive',
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(13)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  heightCm?: number;

  @IsOptional()
  @IsEnum(AthleteLevel)
  athleteLevel?: AthleteLevel;

  @IsOptional()
  @IsNumber()
  weeklyVolumeHours?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trainingFocus?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trainingLocations?: string[];

  @IsOptional()
  @IsString()
  mealsPerDay?: string;

  @IsOptional()
  @IsString()
  mealTiming?: string;

  @IsOptional()
  @IsString()
  macroTracking?: string;

  @IsOptional()
  @IsString()
  supplements?: string;

  @IsOptional()
  @IsString()
  trainingLog?: string;

  @IsOptional()
  @IsString()
  heartRateMonitoring?: string;
}


