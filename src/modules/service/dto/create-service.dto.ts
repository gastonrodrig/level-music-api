import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { Estado } from "../../../core/constants/app.constants";

export class CreateServiceDto {
  @ApiProperty({ example: "Nombre del proveedor", required: false })
  @IsString()
  @IsOptional()
  provider_name?: string;

  @ApiProperty({ example: "Tipo del servicio", required: true })
  @IsString()
  @IsNotEmpty()
  service_type_name: string;

  @ApiProperty({ enum: Estado, example: Estado.ACTIVO })
  @IsEnum(Estado)
  @IsNotEmpty()
  status: Estado;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  provider_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  service_type_id: Types.ObjectId;
}