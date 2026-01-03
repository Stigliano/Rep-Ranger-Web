import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO per refresh token
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token obbligatorio' })
  refreshToken: string;
}

