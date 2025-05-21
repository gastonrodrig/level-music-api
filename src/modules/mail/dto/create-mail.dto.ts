import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateMailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del destinatario',
  })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    example: 'Ejemplo del asunto',
    description: 'Asunto del email',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'Este es el cuerpo del correo.',
    description: 'Cuerpo del email',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
