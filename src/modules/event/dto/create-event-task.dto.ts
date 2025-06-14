import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { PhaseType, TaskStatusType } from "../enum";

export class CreateEventTaskDto {
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsNotEmpty()
  event_id: Types.ObjectId;
  
  @ApiProperty({ type: Types.ObjectId, required: false })
  @IsMongoId()
  @IsOptional()
  template_id?: string;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsNotEmpty()
  worker_type_id: string;

  @ApiProperty({ type: Types.ObjectId, required: false })
  @IsMongoId()
  @IsOptional()
  worker_id?: string;

  @ApiProperty({ example: 'Título  de la tarea de evento' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Notas de la tarea de evento' })
  @IsString()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({ enum: PhaseType, example: PhaseType.PRE_EVENTO })
  @IsEnum(PhaseType)
  @IsNotEmpty()
  phase: PhaseType;

  @ApiProperty({ enum: TaskStatusType, example: TaskStatusType.PENDIENTE })
  @IsEnum(TaskStatusType)
  @IsNotEmpty()
  status: TaskStatusType;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsNotEmpty()
  requires_evidence: boolean;
}