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
  resource: Types.ObjectId;
  
  @ApiProperty({ example: '2023-10-01T00:00:00Z' })
  @IsString() 
  @IsNotEmpty()
  date: string;
}
