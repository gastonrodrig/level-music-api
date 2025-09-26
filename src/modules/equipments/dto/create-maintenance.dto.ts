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
  equipment_id: string;
}
