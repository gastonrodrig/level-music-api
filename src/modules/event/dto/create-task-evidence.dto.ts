import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsOptional, IsString, IsDateString } from "class-validator";


export class CreateTaskEvidenceDto {
    
  @ApiPropertyOptional({ description: "Id de la tarea asociada" })
  @IsMongoId()
  @IsOptional()
  event_task_id?: string;

  @ApiPropertyOptional({ description: "URL del archivo" })
  @IsString()
  file_url: string;

  @ApiPropertyOptional({ example: "2025-05-15T16:32:00.000Z" })
  @IsDateString()
  @IsOptional()
  uploaded_at?: string;

  @ApiPropertyOptional({ example: "2025-05-15T16:33:00.000Z" })
  @IsDateString()
  @IsOptional()
  updated_at?: string;
}