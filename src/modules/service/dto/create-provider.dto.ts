import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

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

  @ApiProperty({example: "Activo",enum: ["Activo", "Inactivo"]})
  @IsString()
  @IsOptional()
  status: string;
}