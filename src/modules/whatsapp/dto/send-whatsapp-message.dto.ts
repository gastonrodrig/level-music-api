import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendWhatsAppMessageDto {
  @ApiProperty({ example: '+51987654321' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Hola, este es un mensaje de prueba' })
  @IsString()
  @IsNotEmpty()
  message: string;
}