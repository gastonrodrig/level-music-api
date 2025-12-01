import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ResourceType } from '../enum';
import { Types } from 'mongoose';

export class CreateAssignationDto {
  @ApiProperty({ type: Types.ObjectId, example: '6501a7c8f0a1b2c3d4e5f678' })
  @IsMongoId()
  @IsNotEmpty()
  event_id: Types.ObjectId;

  @ApiProperty({ enum: ResourceType, example: ResourceType.SERVICE_DETAIL })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  resource_type: ResourceType;

  @ApiProperty({ type: Types.ObjectId, example: '68ca75fe4289595b8bb1a331' })
  @IsMongoId()
  @IsNotEmpty()
  resource_id: Types.ObjectId;

  @ApiProperty({ type: Number, example: 1 })
  @IsNumber()
  @IsOptional()
  hours?: number = 1;

  @ApiProperty({ type: Number, example: 100 })
  @IsNumber()
  @IsNotEmpty()
  hourly_rate: number;

  @ApiProperty({ type: Date, example: '2025-09-22T22:00:00Z' })
  @IsDateString()
  @MaxLength(255)
  available_from: Date;

  @ApiProperty({ type: Date, example: '2025-09-22T22:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  available_to: Date;

  @ApiProperty({ type: Number, example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  payment_percentage_required?: number;

  @ApiProperty({ type: Number, example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity_required?: number;
}
