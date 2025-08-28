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

  @ApiProperty({ 
    example: true, 
    description: 'Si true, el recurso regresa a disponible. Si false, permanece dañado.',
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  return_to_available?: boolean;

  @ApiProperty({ example: '2023-10-01T00:00:00Z' })
  @IsString() 
  @IsOptional()
  rescheduled_date?: string;
}
