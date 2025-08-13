import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { IsString } from "class-validator";
import { CategoryType } from "../enum";
import { Estado } from '../../../core/constants/app.constants';
import { CustomFieldDto } from "./create-event-type-custom-field.dto";
import { Type } from "class-transformer";

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

  @ApiProperty({
    type: [CustomFieldDto],
    required: false,
    description: "Lista de atributos personalizados para el tipo de evento",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  attributes?: CustomFieldDto[];
}