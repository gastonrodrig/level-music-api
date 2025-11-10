import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { PlaceType } from '../enum';
import { Type } from 'class-transformer';

class ServiceRequestedDto {
  @ApiProperty({ example: '64f1c7e1234567890abcde12', required: false })
  @IsString()
  @IsOptional()
  service_type_id: string;

  @ApiProperty({ example: 'DJ Profesional' })
  @IsString()
  @IsNotEmpty()
  service_type_name: string;

  @ApiProperty({ example: 'Con cabina incluida', required: true })
  @IsString()
  @IsOptional()
  details?: string;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Nombre del evento', required: true })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ example: 'Descripcion del evento', required: true })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: '2023-12-31', required: true })
  @IsDateString()
  @IsOptional()
  event_date: Date;

  @ApiProperty({ example: '2025-10-01T12:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  start_time: Date;

  @ApiProperty({ example: '2025-10-01T20:00:00.000Z', required: true })
  @IsDateString()
  @IsNotEmpty()
  end_time: Date;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  attendees_count?: number | null;

  @ApiProperty({ example: 'Calle Falsa 123', required: false })
  @IsString()
  @IsOptional()
  exact_address?: string | null;

  @ApiProperty({ example: 'Cerca del parque central', required: false })
  @IsString()
  @IsOptional()
  location_reference?: string | null;

  @ApiProperty({ example: 'Abierto', enum: PlaceType, required: true })
  @IsString()
  @IsOptional()
  place_type: PlaceType;

  @ApiProperty({ example: 500, required: false })
  @IsNumber()
  @IsOptional()
  place_size?: number | null;

  @ApiProperty({ example: '64f1c7e1234567890abcde12', required: false, nullable: true })
  @IsOptional()
  user_id?: string | null;

  @ApiProperty({ example: '64f1c7e1234567890abcde34', required: false, nullable: true })
  @IsOptional()
  event_type_id?: string | null;

  @ApiProperty({ example: 'Evento Corporativo', required: false, nullable: true })
  @IsString()
  @IsOptional()
  event_type_name?: string | null;

  @ApiProperty({ type: [ServiceRequestedDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceRequestedDto)
  services_requested?: ServiceRequestedDto[];

  @ApiProperty({ example: 1500.5, required: false, nullable: true })
  @IsNumber()
  @IsNotEmpty()
  estimated_price?: number | null;

  @ApiProperty({ example: 1500.5, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  final_price?: number | null;
}
