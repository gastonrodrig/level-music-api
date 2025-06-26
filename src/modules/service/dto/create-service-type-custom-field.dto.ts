import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { CustomFieldType } from "../enum/service-type-custom-field-type.enum";

export class CustomFieldDto {
  @ApiProperty({ example: 'area_m2' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CustomFieldType, example: CustomFieldType.NUMBER })
  @IsEnum(CustomFieldType)
  @IsNotEmpty()
  type: CustomFieldType;

  @ApiProperty({ example: true })
  @IsBoolean()
  required: boolean;
}