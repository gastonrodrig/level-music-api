import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { StoreMovementType } from '../enum';

export class CreateStorehouseMovementDto {
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsNotEmpty()
  equipment_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsNotEmpty()
  event_id: Types.ObjectId;

  @ApiProperty({ enum: StoreMovementType, required: false })
  @IsEnum(StoreMovementType)
  @IsNotEmpty()
  movement_type: StoreMovementType;

  @ApiProperty({ example: new Date().toISOString() })
  @IsString()
  @IsNotEmpty()
  movement_date: Date;
}
