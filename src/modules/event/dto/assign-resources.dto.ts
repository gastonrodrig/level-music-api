import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType } from '../enum';

class AssignResourceItemDto {
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
  @IsNotEmpty()
  available_from: Date;

  @ApiProperty({ type: Date, example: '2025-09-22T23:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  available_to: Date;

  @ApiProperty({ type: Number, example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  payment_percentage_required?: number;
}

export class UpdateEventWithResourcesDto {
  @ApiProperty({ example: 'Concierto Corporativo', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ example: 'Evento con música en vivo y DJ', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ type: [AssignResourceItemDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignResourceItemDto)
  @IsOptional()
  resources?: AssignResourceItemDto[];
}
