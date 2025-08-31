import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MaintenanceStatusType } from '../enum';

export class UpdateMaintenanceStatusDto {
  @ApiProperty({ enum: MaintenanceStatusType, example: MaintenanceStatusType.FINALIZADO })
  @IsEnum(MaintenanceStatusType)
  @IsNotEmpty()
  status: MaintenanceStatusType;

  @ApiProperty({ example: 'Motivo de reagendacion', required: false })
  @IsString()
  @IsOptional()
  reagendation_reason?: string;

  @ApiProperty({ example: 'Motivo de cancelacion', required: false })
  @IsString()
  @IsOptional()
  cancelation_reason?: string;


  @ApiProperty({ example: '2023-10-01T00:00:00Z' })
  @IsString() 
  @IsOptional()
  rescheduled_date?: string;
}
