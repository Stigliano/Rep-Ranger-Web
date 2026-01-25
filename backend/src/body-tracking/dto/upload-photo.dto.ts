import { IsString, IsIn, IsDateString, IsOptional } from 'class-validator';

export class UploadPhotoDto {
  @IsString()
  @IsIn(['front', 'side', 'back'])
  viewType: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
