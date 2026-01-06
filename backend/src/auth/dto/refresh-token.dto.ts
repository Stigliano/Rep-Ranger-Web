import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO per refresh token
 * Validazione rigorosa per garantire sicurezza del token
 */
export class RefreshTokenDto {
  @IsString({ message: 'Refresh token deve essere una stringa' })
  @IsNotEmpty({ message: 'Refresh token obbligatorio' })
  @MinLength(10, { message: 'Refresh token non valido' })
  @MaxLength(500, { message: 'Refresh token troppo lungo' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  refreshToken: string;
}
