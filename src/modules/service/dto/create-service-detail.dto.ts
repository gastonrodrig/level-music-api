import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsObject, IsNumber, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";
import { Estado } from "src/core/constants/app.constants";

export class CreateServiceDetailDto {
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsNotEmpty()
  service: string;

  @ApiProperty({ example: {} })
  @IsObject()
  @IsNotEmpty()
  details: Object;
  
  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @IsNotEmpty()
  ref_price?: Estado;
}
  