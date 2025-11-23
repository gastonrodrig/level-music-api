import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { StoreMovementType } from '../enum';
import { LocationType } from 'src/modules/equipments/enum';

export class CreateFromStorehouseDto {
  @ApiProperty({ example: 'SAL-4INDKI' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: StoreMovementType })
  @IsEnum(StoreMovementType)
  @IsNotEmpty()
  movement_type: StoreMovementType;

  @ApiProperty({ enum: LocationType, required: false })
  @IsEnum(LocationType)
  @IsOptional()
  destination?: LocationType;
}
