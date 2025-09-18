import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsOptional, IsNumber, IsMongoId, IsEnum, IsNotEmpty } from 'class-validator';
import { StatusType, PlaceType } from '../enum';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class CreateIncidentDto {

  @ApiProperty({ example: 'Descripcion del evento', required: true })
  @IsString()
  @IsNotEmpty()
  description: string;
  
  @ApiProperty({ example: '18:00 - 23:00', required: true })
  @IsString()
  @IsNotEmpty()
  incident_date: string;

  @ApiProperty({ example: '18:00 - 23:00', required: true })
  @IsString()
  @IsNotEmpty()
  incident_location: string;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  event_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  worked_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  resource_id: Types.ObjectId;

}