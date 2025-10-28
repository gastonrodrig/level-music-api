import { IsEnum, IsNotEmpty } from 'class-validator';
import { AppointmentStatus } from '../enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentDto {
  @ApiProperty({ example: AppointmentStatus.CONFIRMADA, enum: AppointmentStatus, required: false })
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status?: AppointmentStatus;
}