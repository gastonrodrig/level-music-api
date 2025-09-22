import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { MovementType } from '../enum';

export class CreateStorehouseMovementDto {
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsNotEmpty()
  equipment_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsNotEmpty()
  event_id: Types.ObjectId;

  @ApiProperty({ enum: MovementType, required: false })
  @IsEnum(MovementType)
  @IsNotEmpty()
  movement_type: MovementType;

  @ApiProperty({ example: new Date().toISOString() })
  @IsString()
  @IsNotEmpty()
  movement_date: Date;
}
