import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean,IsArray,ValidateNested ,  IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { Type } from "class-transformer";
import { PhaseType, TaskStatusType,TaskPhase } from "../enum";
import { CreateTaskEvidenceDto } from "./create-task-evidence.dto";

export class CreateEventTaskDto {
  @ApiProperty({ type: String, description: "Event id relacionado" })
  @IsMongoId()
  @IsOptional()
  event_id: Types.ObjectId;

  @ApiProperty({ type: String, description: "EventType id (opcional si se infiere desde el event)" })
  @IsMongoId()
  @IsNotEmpty()
  event_type_id?: Types.ObjectId;

  @ApiProperty({ type: String, description: "Worker type id (requerido para asignación de perfil de trabajador)" })
  @IsMongoId()
  @IsNotEmpty()
  worker_type_id: string;

  @ApiProperty({ type: String, description: "Worker id (si ya está asignado)" })
  @IsMongoId()
  @IsOptional()
  worker_id?: string;

  @ApiPropertyOptional({ description: "Título de la tarea. Si no se envía y se incluye attribute_index/attribute_name, el backend debe resolver title = attribute_name" })
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ description: "Notas u observaciones" })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ enum: TaskStatusType, description: "Estado inicial (por defecto PENDIENTE)", example: TaskStatusType.PENDIENTE })
  @IsEnum(TaskStatusType)
  @IsOptional()
  status?: TaskStatusType;

  @ApiProperty({ description: "Si la tarea requiere evidencia" })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  requires_evidence?: boolean;

  @ApiProperty({ example: '2025-10-01T12:00:00.000Z' })
  @IsOptional()
  assigned_at?: Date;

  @ApiProperty({ example: '2025-10-01T12:00:00.000Z' })
  @IsOptional()
  completed_at?: Date;

  // snapshots opcionales (si cliente quiere enviar)
  
  @IsString()
  @IsOptional()
  worker_type_name?: string;

  
  @IsString()
  @IsOptional()
  worker_name?: string;

  // opcional: phase (para que coincida con tu modelo de respuesta)
  @ApiPropertyOptional({ enum: TaskPhase })
  @IsEnum(TaskPhase)
  @IsOptional()
  phase?: TaskPhase;

  // opcional: permitir evidences si el cliente envía snapshots al crear (no es obligatorio)
  @ApiPropertyOptional({ type: [CreateTaskEvidenceDto], description: 'Evidences (opcional al crear)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskEvidenceDto)
  evidences?: CreateTaskEvidenceDto[];

}