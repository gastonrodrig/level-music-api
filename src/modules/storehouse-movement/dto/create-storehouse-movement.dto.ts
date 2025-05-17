import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { MovementType } from '../enum';

export class CreateStorehouseMovementDto {
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsOptional()
  resource_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsOptional()
  event_id: Types.ObjectId;

  @ApiProperty({ enum: MovementType, required: false })
  @IsEnum(MovementType)
  @IsOptional()
  movement_type?: MovementType;

  @ApiProperty({ example: new Date().toISOString() })
  @IsString()
  @IsOptional()
  movement_date?: Date;
}
