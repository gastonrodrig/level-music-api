import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendQuotationReadyMailDto {
  @ApiProperty({
    example: 'cliente@gmail.com',
    description: 'Correo del cliente al que se enviará la notificación.',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    example: '675c9c3df72a23c5a8b88990',
    required: false,
    description: 'ID del usuario cliente para construir el saludo personalizado.',
  })
  @IsOptional()
  @IsString()
  user_id?: string;
}
