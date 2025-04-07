import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { MaintenanceType } from '../enum/maintenanceType';

export class CreateEquipmentMaintenanceDto {
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsOptional()
  equipment_id: Types.ObjectId;

  @ApiProperty({ enum: MaintenanceType, required: false })
  @IsEnum(MaintenanceType)
  @IsOptional()
  maintenance_type?: MaintenanceType;

  @ApiProperty({ example: 'Descripcion del mantenimiento', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2023-10-01', required: false })
  @IsString()
  @IsOptional()
  date?: Date;
}
