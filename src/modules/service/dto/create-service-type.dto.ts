import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEnum, IsNotEmpty, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";
import { Estado } from "src/core/constants/app.constants";
import { ServiceTypeCustomFieldDto } from "./create-service-type-custom-field.dto";

export class CreateServiceTypeDto {
  @ApiProperty({ example: "Fotografía" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "Servicio de cobertura de fotos" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: Estado, example: Estado.ACTIVO })
  @IsEnum(Estado)
  @IsNotEmpty()
  status: Estado;

  @ApiProperty({
    type: [ServiceTypeCustomFieldDto],
    required: false,
    description: "Lista de atributos personalizados para el tipo de servicio"
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTypeCustomFieldDto)
  attributes?: ServiceTypeCustomFieldDto[];
}