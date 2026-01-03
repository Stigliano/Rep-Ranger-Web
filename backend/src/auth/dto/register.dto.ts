import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

/**
 * DTO per registrazione utente
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Email non valida' })
  @IsNotEmpty({ message: 'Email obbligatoria' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password deve essere almeno 8 caratteri' })
  @MaxLength(100, { message: 'Password troppo lunga' })
  @IsNotEmpty({ message: 'Password obbligatoria' })
  password: string;

  @IsString()
  @MinLength(1, { message: 'Nome obbligatorio' })
  @MaxLength(255, { message: 'Nome troppo lungo' })
  @IsNotEmpty({ message: 'Nome obbligatorio' })
  name: string;
}

