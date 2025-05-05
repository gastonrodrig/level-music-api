import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDecimal, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

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

   @ApiProperty({ example: 'Activo', enum: ['Activo', 'Inactivo'], required: false })
   @IsString()
   @IsOptional()
   status?: string;
  
   @ApiProperty({ type: Types.ObjectId, example: '63f1b2c4e4b0d5a1c8f9e7a6', required: true })
   @IsString()
   @IsOptional()
   ProviderId: Types.ObjectId;

    @ApiProperty({ type: Types.ObjectId, example: '63f1b2c4e4b0d5a1c8f9e7a6', required: true })
    @IsString()
    @IsOptional()
    ServiceTypeId: Types.ObjectId;

}