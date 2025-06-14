import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ResourceType } from '../enum';

export class CreateResourceDto {
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

  @ApiProperty({ example: '2023-10-01T00:00:00Z', description: 'Próxima fecha de mantenimiento preventivo' })
  @IsDateString()
  @IsNotEmpty()
  next_maintenance_date: string;
}
