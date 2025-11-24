import { IsArray, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { TaskStatusType } from '../enum';

export class UpdateSubtaskDto {
  @IsOptional()
  @IsEnum(TaskStatusType)
  status?: TaskStatusType;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsMongoId()
  worker_id?: string; 

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  deleted_evidence_ids?: string[];
}