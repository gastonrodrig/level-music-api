import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { MaintenanceType } from '../enum/maintenance-type';
import { Transform } from 'class-transformer';

export class CreateMaintenanceDto {
  @ApiProperty({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  @IsNotEmpty()
  type: MaintenanceType;

  @ApiProperty({ example: 'Descripcion del mantenimiento' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsNotEmpty()
  resource_id: Types.ObjectId;

  @ApiProperty({ example: new Date().toISOString() })
  @IsString()
  @IsNotEmpty()
  date: string;
}
