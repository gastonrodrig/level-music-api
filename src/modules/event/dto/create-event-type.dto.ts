import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from 'class-validator';
import { IsString } from "class-validator";
import { CategoryType } from "../enum";
import { Estado } from '../../../core/constants/app.constants';

export class CreateEventTypeDto {
  @ApiProperty({ example: 'Descripcion del tipo de evento', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Boda', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'Social', enum: CategoryType, required: false })
  @IsString()
  @IsOptional()
  category?: CategoryType;

  @ApiProperty({ enum: Estado, example: Estado.ACTIVO })
  @IsEnum(Estado)
  @IsOptional()
  status?: Estado;
}