import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { Estado } from "src/core/constants/app.constants";

export class CreateServiceDto {
  @ApiProperty({ enum: Estado, example: Estado.ACTIVO })
  @IsEnum(Estado)
  @IsNotEmpty()
  status: Estado;

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  provider_id: string;

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  service_type_id: string;
}