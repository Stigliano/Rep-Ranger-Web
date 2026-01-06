import { IsEmail, IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO per login utente
 * Validazione rigorosa per prevenire injection e garantire sicurezza
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email non valida' })
  @IsNotEmpty({ message: 'Email obbligatoria' })
  @MaxLength(255, { message: 'Email troppo lunga' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsString({ message: 'Password deve essere una stringa' })
  @IsNotEmpty({ message: 'Password obbligatoria' })
  @MinLength(1, { message: 'Password obbligatoria' })
  @MaxLength(100, { message: 'Password troppo lunga' })
  password: string;
}
