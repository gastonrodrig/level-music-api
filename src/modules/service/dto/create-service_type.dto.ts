import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class CreateServiceTypeDto {

  @ApiProperty({ example: "Comida, Fotografia, Toldos", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "Descripcion del servicio", required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
  