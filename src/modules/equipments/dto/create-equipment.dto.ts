import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { EquipmentType } from '../enum';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Nombre del equipo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Descripcion del equipo' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: EquipmentType, example: EquipmentType.SONIDO })
  @IsEnum(EquipmentType)
  @IsNotEmpty()
  equipment_type: EquipmentType;

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
