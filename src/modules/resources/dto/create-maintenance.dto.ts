import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { MaintenanceType } from '../enum/maintenance-type.enum';

export class CreateMaintenanceDto {
  @ApiProperty({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  @IsNotEmpty()
  type: MaintenanceType;

  @ApiProperty({ example: 'Descripcion del mantenimiento' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  resource_id: string;

  @ApiProperty({ example: '2023-10-01T00:00:00Z' })
  @IsString() 
  @IsNotEmpty()
  date: string;
}
