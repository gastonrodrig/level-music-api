import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsMongoId,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSubtaskDto } from './';
import { TaskPhase } from '../enum';
import { StoreMovementType } from 'src/modules/storehouse/enum';

export class CreateEventTaskDto {
  @ApiProperty({
    example: 'Preparación logística',
  })
  @IsString()
  @IsNotEmpty()
  task_name: string;

  @ApiProperty({
    example: 'Actividades previas al evento',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '69118d1317287ae708fe0ed4',
  })
  @IsMongoId()
  @IsNotEmpty()
  event_id: string;

  @ApiProperty({
    example: [
      {
        is_for_storehouse: true,
        subtask_name: 'Salida de equipos del almacén',
        phase: TaskPhase.PLANIFICACION,
        price: 450,
        worker: ['672fab3299336b9d0c34e912'],
        requires_evidence: true,
        storehouse_movement_type: StoreMovementType.SALIDA_ALMACEN,
        storehouse_code: 'ALM-001',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subtasks: CreateSubtaskDto[];
}
