import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Inserire un indirizzo email valido' })
  @IsNotEmpty({ message: "L'email è obbligatoria" })
  email: string;
}

