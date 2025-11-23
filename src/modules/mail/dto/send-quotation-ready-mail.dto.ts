import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendQuotationReadyMailDto {
  @ApiProperty({
    example: 'cliente@gmail.com',
    description: 'Correo del cliente al que se enviará la notificación.',
  })
  @IsEmail()
  to: string;
}
