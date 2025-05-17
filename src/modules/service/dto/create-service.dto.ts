import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDecimal, IsEnum, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { Estado } from "src/core/constants/app.constants";

export class CreateServiceDto {
@ApiProperty({ example: "Nombre del servicio de Evento", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "Descripcion del servicio", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: "Precio del servicio", required: false })
  @IsDecimal()
  @IsOptional()
  price?: string;

  @ApiProperty({ enum: Estado, example: Estado.ACTIVO })
  @IsEnum(Estado)
  @IsOptional()
  status?: Estado;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsOptional()
  provider_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsOptional()
  service_type_id: Types.ObjectId;
}