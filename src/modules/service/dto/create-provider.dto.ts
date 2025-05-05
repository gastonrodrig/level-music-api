import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class CreateProviderDto {

  @ApiProperty({ example: "Nombre del proveedor", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "nombre de contacto", required: false })
  @IsString()
  @IsOptional()
  contact_name?: string;

  @ApiProperty({ example: "telefono de contacto", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: "correo de contacto", required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({example: "Activo",enum: ["Activo", "Inactivo"],required: false,})
  @IsString()
  @IsOptional()
  status?: string;
}