import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsOptional, IsNumber, IsMongoId, IsEnum, IsNotEmpty } from 'class-validator';
import { StatusType, PlaceType } from '../enum';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ example: 'Nombre del evento', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Descripcion del evento', required: true })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2023-12-31T23:59:59.000Z', required: true })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: '18:00 - 23:00', required: true })
  @IsString()
  @IsNotEmpty()
  time_range: string;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  attendees_count?: number;

  @ApiProperty({ example: 'Calle Falsa 123', required: false })
  @IsString()
  @IsOptional()
  exact_address?: string;

  @ApiProperty({ example: 'Cerca del parque central', required: false })
  @IsString()
  @IsOptional()
  location_reference?: string;

  @ApiProperty({ example: 'Abierto', enum: PlaceType, required: true })
  @IsString()
  @IsNotEmpty()
  place_type: PlaceType;

  @ApiProperty({ example: 500, required: false })
  @IsNumber()
  @IsOptional()
  place_size?: number;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  user_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  event_type_id: string;

  @ApiProperty({ example: 'Pendiente', enum: StatusType, required: true })
  @IsEnum(StatusType)
  @IsNotEmpty()
  state: StatusType;

  @ApiProperty({ example: 1500.50, required: false })
  @IsNumber()
  @IsOptional()
  final_price?: number;
}