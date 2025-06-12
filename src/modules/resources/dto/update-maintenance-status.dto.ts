import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MaintenanceStatusType } from '../enum';

export class UpdateMaintenanceStatusDto {
  @ApiProperty({ enum: MaintenanceStatusType, example: MaintenanceStatusType.FINALIZADO })
  @IsEnum(MaintenanceStatusType)
  @IsNotEmpty()
  status: MaintenanceStatusType;
}
