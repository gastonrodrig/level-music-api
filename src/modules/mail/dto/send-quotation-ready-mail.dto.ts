import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendQuotationReadyMailDto {
  @ApiProperty({
    example: 'cliente@gmail.com',
    description: 'Correo del cliente al que se enviará la notificación.',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'ID del evento.',
  })
  @IsMongoId()
  @IsNotEmpty()
  event_id: string;
}
