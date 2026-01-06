import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Il token è obbligatorio' })
  token: string;

  @IsString()
  @IsNotEmpty({ message: 'La password è obbligatoria' })
  @MinLength(8, { message: 'La password deve essere di almeno 8 caratteri' })
  newPassword: string;
}

