import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum, IsNotEmpty } from "class-validator";
import { Estado } from "src/core/constants/app.constants";

export class CreateProviderDto {

  @ApiProperty({ example: "Nombre del proveedor" })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ example: "nombre de contacto" })
  @IsString()
  @IsOptional()
  contact_name: string;

  @ApiProperty({ example: "telefono de contacto" })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ example: "correo de contacto" })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({ enum: Estado, example: Estado.ACTIVO })
  @IsEnum(Estado)
  @IsNotEmpty()
  status: Estado;
}