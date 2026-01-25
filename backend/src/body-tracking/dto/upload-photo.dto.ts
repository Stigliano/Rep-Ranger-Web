import { IsString, IsIn, IsDateString, IsOptional } from 'class-validator';

export class UploadPhotoDto {
  @IsString()
  @IsIn(['FRONT', 'BACK', 'LEFT_SIDE', 'RIGHT_SIDE'])
  viewType: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
