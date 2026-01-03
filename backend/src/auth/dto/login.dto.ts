import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO per login utente
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email non valida' })
  @IsNotEmpty({ message: 'Email obbligatoria' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password obbligatoria' })
  password: string;
}

