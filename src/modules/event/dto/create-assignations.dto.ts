import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { DayOfWeek, ResourceType } from '../enum';
import { Types } from 'mongoose';

export class CreateAssignationDto {
  @ApiProperty({ example: 'Disponible desde', required: true })
  @IsString()
  @IsNotEmpty()
  available_from: string;

  @ApiProperty({ example: 'Disponible hasta', required: true })
  @IsString()
  @IsNotEmpty()
  available_to: string;

  @ApiProperty({ example: 'Social', enum: DayOfWeek, required: false })
  @IsEnum(DayOfWeek)
  @IsOptional()
  day_of_week?: DayOfWeek;

  @ApiProperty({ example: 'Social', enum: ResourceType, required: false })
  @IsEnum(ResourceType)
  @IsOptional()
  resource_type?: ResourceType;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  event: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  worker: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  resource: Types.ObjectId;
}
