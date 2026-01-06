import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO per registrazione utente
 * Validazione rigorosa per prevenire injection e garantire sicurezza
 * Conforme a standard industriali per applicazioni critiche
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Email non valida' })
  @IsNotEmpty({ message: 'Email obbligatoria' })
  @MaxLength(255, { message: 'Email troppo lunga' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsString({ message: 'Password deve essere una stringa' })
  @MinLength(8, { message: 'Password deve essere almeno 8 caratteri' })
  @MaxLength(100, { message: 'Password troppo lunga (massimo 100 caratteri)' })
  @IsNotEmpty({ message: 'Password obbligatoria' })
  // Pattern opzionale: almeno una lettera e un numero (può essere rimosso se troppo restrittivo)
  // @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
  //   message: 'Password deve contenere almeno una lettera e un numero',
  // })
  password: string;

  @IsString({ message: 'Nome deve essere una stringa' })
  @MinLength(1, { message: 'Nome obbligatorio' })
  @MaxLength(255, { message: 'Nome troppo lungo (massimo 255 caratteri)' })
  @IsNotEmpty({ message: 'Nome obbligatorio' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;
}
