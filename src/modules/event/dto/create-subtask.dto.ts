import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsMongoId,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { TaskPhase } from '../enum';

export class CreateSubtaskDto {
  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_for_storehouse: boolean;
  
  @ApiProperty({
    example: 'Salida de equipos del almacén',
  })
  @IsString()
  @IsNotEmpty()
  subtask_name: string;

  @ApiProperty({
    example: TaskPhase.PLANIFICACION,
  })
  @IsEnum(TaskPhase)
  phase: TaskPhase;

  @ApiPropertyOptional({
    example: 350.0,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: '672fab3299336b9d0c34e912' })
  @IsOptional()
  worker_id: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  requires_evidence?: boolean;

  @ApiPropertyOptional({
    example: 'Salida de almacén',
  })
  @IsOptional()
  @IsString()
  storehouse_movement_type?: string;

  @ApiPropertyOptional({
    example: 'ALM-001',
  })
  @IsOptional()
  @IsString()
  storehouse_code?: string;
}
