import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsEnum,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { StatusType, PlaceType, QuotationCreator } from '../enum';
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

  @ApiProperty({ example: '18:00', required: true })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({ example: '23:00', required: true })
  @IsString()
  @IsNotEmpty()
  end_time: string;

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
  @IsNotEmpty()
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
  @ValidateNested({ each: true })
  @Type(() => ServiceRequestedDto)
  services_requested?: ServiceRequestedDto[];

  @ApiProperty({ example: 1500.5, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  estimated_price?: number | null;

  @ApiProperty({ example: 1500.5, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  final_price?: number | null;

  // segun yo cuando se modifica el schema tambien el dto ya que este recibe los datos y 
  // los valida al sincronizar con la base de datos
  // @ApiProperty({ enum: QuotationCreator, description: 'Quién creó la cotización (admin o cliente)' })
  // @IsEnum(QuotationCreator)
  // @IsOptional() // Si quieres que sea opcional
  // creator?: QuotationCreator;
}
