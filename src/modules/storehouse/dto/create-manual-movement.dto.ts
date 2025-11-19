import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { StoreMovementType } from '../enum';
import { LocationType } from 'src/modules/equipments/enum';

export class CreateManualMovementDto {
  @ApiProperty({ example: 'JBL-001' })
  @IsString()
  @IsNotEmpty()
  serial_number: string;

  @ApiProperty({ enum: StoreMovementType })
  @IsEnum(StoreMovementType)
  @IsNotEmpty()
  movement_type: StoreMovementType;

  @ApiProperty({ example: 'SAL-JANGIY', required: false })
  @IsString()
  @IsOptional()
  event_code?: string;

  @ApiProperty({ enum: LocationType, required: false })
  @IsEnum(LocationType)
  @IsOptional()
  destination?: LocationType;
}
