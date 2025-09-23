import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsMongoId,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Types } from 'mongoose';
import { IncidentType, ResourceType } from '../enum';

export class CreateIncidentDto {
  @ApiProperty({ example: ResourceType.EQUIPO_DE_LUZ, enum: ResourceType })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  resource_type: ResourceType;

  @ApiProperty({ example: IncidentType.EVENTO, enum: IncidentType })
  @IsEnum(IncidentType)
  @IsNotEmpty()
  incident_type: IncidentType;

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
  worker_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  resource_id: Types.ObjectId;
}
