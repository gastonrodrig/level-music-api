import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CreatefoodServiceDto {
   @ApiProperty({ example: "auth_id_example", required: false })
   @IsString()
   @IsOptional()
   auth_id?: string;

   @ApiProperty({ example: "Nombre del servicio de Comida", required: false })
   @IsString()
   @IsOptional()
   name?: string;

   @ApiProperty({ example: "Descripcion del servicio", required: false })
   @IsString()
   @IsOptional()
   description?: string;
    
   @ApiProperty({ example: "Precio del servicio", required: false })
   @IsArray()
   @IsOptional()
   multimedia: string[];
  }
