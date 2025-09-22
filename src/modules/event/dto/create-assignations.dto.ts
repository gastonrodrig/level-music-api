import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ResourceType } from '../enum';

export class CreateAssignationDto {
  @ApiProperty({ type: String, example: '6501a7c8f0a1b2c3d4e5f678' })
  @IsMongoId()
  @IsNotEmpty()
  event_id: string;

  @ApiProperty({ enum: ResourceType, example: ResourceType.SERVICE_DETAIL })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  resource_type: ResourceType;

  @ApiProperty({ type: String, example: '68ca75fe4289595b8bb1a331' })
  @IsMongoId()
  @IsNotEmpty()
  resource_id: string;

  @ApiProperty({ type: Number, example: 5 })
  @IsNumber()
  @IsNotEmpty()
  hours: number;

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
}
