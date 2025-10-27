import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEventTaskDto } from './';
import { IsBoolean,IsArray,ValidateNested ,  IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, IsDateString } from "class-validator";

export class UpdateEventTaskDto  {
@ApiProperty({ type: String, description: 'ID del trabajador a asignar' })
  @IsMongoId()
  @IsOptional()
  worker_id: string;

  
  @IsOptional()
  assigned_at?: string;


}