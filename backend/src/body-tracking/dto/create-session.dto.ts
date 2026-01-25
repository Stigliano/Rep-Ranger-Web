import { IsDateString, IsNumber, IsOptional, IsString, IsArray, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  photoIds: string[];
}
