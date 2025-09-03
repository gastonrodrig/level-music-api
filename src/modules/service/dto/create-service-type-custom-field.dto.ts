import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ServiceTypeCustomFieldType} from "../enum";

export class ServiceTypeCustomFieldDto {
  @ApiProperty({ example: 'area_m2' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ServiceTypeCustomFieldType, example: ServiceTypeCustomFieldType.NUMBER })
  @IsEnum(ServiceTypeCustomFieldType)
  @IsNotEmpty()
  type: ServiceTypeCustomFieldType;

  @ApiProperty({ example: true })
  @IsBoolean()
  required: boolean;
}
