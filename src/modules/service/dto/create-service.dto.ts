import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateServiceDto {
  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  provider_id: string;

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  service_type_id: string;

  @ApiProperty({
    description:
      'Detalles del servicio; puede llegar como JSON string o como array de objetos',
    example:
      '{ "example": "Escenario Principal", "example": "Con sonido y pantallas LED" }',
  })
  @IsNotEmpty()
  details: any;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  ref_price: number;
}