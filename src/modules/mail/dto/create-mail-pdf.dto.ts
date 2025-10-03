import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class CreateGmailPdfDto {
    @ApiProperty({
    example: 'usuario@correo.com',
    description: 'Correo del destinatario.',
  })
  @IsEmail()
  @IsNotEmpty()
  to: string;

    @ApiProperty({  
    example: 'Asunto del correo',
    description: 'Asunto del correo.',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;
 
  
}