import { ApiProperty } from "@nestjs/swagger";
import { CreateEventTaskDto } from "./create-event-task.dto";
import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateMultipleTasksDto {
  @ApiProperty({ type: [CreateEventTaskDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventTaskDto)
  tasks: CreateEventTaskDto[];
}