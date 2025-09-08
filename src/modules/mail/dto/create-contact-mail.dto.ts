import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateContactMailDto {
  @ApiProperty({
    example: 'juanperez@example.com',
    description: 'Correo electrónico del cliente (remitente)',
  })
  @IsEmail()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre de la persona que contacta',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Hola, me interesa contratar sus servicios para mi próximo evento.',
    description: 'Mensaje enviado por el contacto',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
