import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmAppointmentDto {
  @ApiProperty({ example: '2025-11-07', required: true })
  @IsDateString()
  @IsNotEmpty()
  appointment_date: Date;

  @ApiProperty({ example: '02:00 PM', required: true })
  @IsString()
  @IsNotEmpty()
  hour: string;
}
