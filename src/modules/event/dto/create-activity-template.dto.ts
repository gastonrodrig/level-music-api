import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { PhaseType } from "../enum/phase-type";

export class CreateActivityTemplateDto {
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsOptional()
  event_type_id: Types.ObjectId;
  
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  worker_type_id: string;

  @ApiProperty({ example: 'Título  de la plantilla de actividad' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Descripcion de la tarea de evento' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Pre Evento', enum: PhaseType, required: true })
  @IsString()
  phase_type: PhaseType;
}