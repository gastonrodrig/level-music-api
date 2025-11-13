import { ApiProperty } from "@nestjs/swagger";
import { TaskPhase } from "../enum";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UpdateEventTaskDto } from "./update-event-task.dto";

export class UpdateMultipleTasksDto {
  @ApiProperty({
    description: 'Lista de tareas a actualizar',
    example: [
      {
        event_task_id: '67118d1317287ae708fe0abc',
        task_name: 'Preparación logística actualizada',
        description: 'Desc actualizada',
        subtasks: [
          {
            is_for_storehouse: true,
            subtask_name: 'Nueva subactividad',
            phase: TaskPhase.EJECUCION,
            price: 200,
            worker_id: '672fab3299336b9d0c34e912',
            requires_evidence: true,
            storehouse_movement_type: 'Recepción',
            storehouse_code: 'ALM-020'
          }
        ]
      }
    ]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateEventTaskDto)
  tasks: (UpdateEventTaskDto & { event_task_id: string })[];
}
