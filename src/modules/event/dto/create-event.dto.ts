import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsOptional, IsNumber } from 'class-validator';
import { StatusType, PlaceType } from '../enum';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ example: 'Nombre del evento', required: true })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ example: 'Descripcion del evento', required: true })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: '2023-12-31T23:59:59.000Z', required: true })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: '18:00 - 23:00', required: true })
  @IsString()
  time_range: string;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  attendees_count?: number;

  @ApiProperty({ example: 'Calle Falsa 123', required: false })
  @IsOptional()
  @IsString()
  exact_address?: string;

  @ApiProperty({ example: 'Cerca del parque central', required: false })
  @IsOptional()
  @IsString()
  location_reference?: string;

  @ApiProperty({ example: 'Abierto', enum: PlaceType, required: true })
  @IsString()
  place_type: PlaceType;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  place_size?: number;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsOptional()
  user_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  event_type_id: string;

  @ApiProperty({ example: 'Pendiente', enum: StatusType, required: true })
  @IsString()
  state: StatusType;

  @ApiProperty({ example: 1500.50, required: false })
  @IsOptional()
  @IsNumber()
  final_price?: number;
}