import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ResourceType } from '../enum';

export class UpdateResourceDto {
  @ApiProperty({ example: 'Nombre del recurso' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Descripcion del recurso' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ResourceType, example: ResourceType.SONIDO })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  resource_type: ResourceType;

  @ApiProperty({ example: '2023-09-15T00:00:00Z', description: 'Fecha del último mantenimiento realizado (opcional)' })
  @IsDateString()
  @IsOptional()
  last_maintenance_date?: string;

  @ApiProperty({ example: 30, description: 'Intervalo de mantenimiento en días' })
  @IsNumber()
  @IsNotEmpty()
  maintenance_interval_days: number;
}
