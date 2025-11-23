import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';
import { StoreMovementType } from '../enum';
import { LocationType } from 'src/modules/equipments/enum';

export class CreateManualMovementDto {
  @ApiProperty({ example: '002112..' })
  @IsMongoId()
  @IsNotEmpty()
  equipment_id?: string;

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
