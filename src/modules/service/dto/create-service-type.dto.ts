import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum } from "class-validator";
import { Estado } from "src/core/constants/app.constants";

export class CreateServiceTypeDto {
  @ApiProperty({ example: "Comida, Fotografia, Toldos", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "Descripcion del servicio", required: false })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiProperty({ enum: Estado, example: Estado.ACTIVO })
  @IsEnum(Estado)
  @IsOptional()
  status?: Estado;
}
  