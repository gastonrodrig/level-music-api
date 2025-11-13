import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateSubtaskDto } from './';
import { Type } from 'class-transformer';
import { StoreMovementType } from 'src/modules/storehouse/enum';
import { TaskPhase } from '../enum';

export class UpdateEventTaskDto {
  @ApiProperty({
    example: 'Preparación logística actualizada',
  })
  @IsString()
  @IsNotEmpty()
  task_name: string;

  @ApiProperty({
    example: 'Descripción actualizada de la actividad',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: [
      {
        is_for_storehouse: true,
        subtask_name: 'Recepción en evento',
        phase: TaskPhase.EJECUCION,
        price: 200,
        worker: ['672fab3299336b9d0c34e912'],
        requires_evidence: true,
        storehouse_movement_type: StoreMovementType.RECEPCION_EVENTO,
        storehouse_code: 'ALM-020',
      },
      {
        is_for_storehouse: false,
        subtask_name: 'Toma de evidencias finales',
        phase: TaskPhase.SEGUIMIENTO,
        price: 150,
        worker: ['672fab3299336b9d0c34e917'],
        requires_evidence: false,
        storehouse_movement_type: null,
        storehouse_code: null,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subtasks: CreateSubtaskDto[];
}
