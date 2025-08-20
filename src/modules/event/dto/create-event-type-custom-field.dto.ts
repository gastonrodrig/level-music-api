import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class EventTypeCustomFieldDto {
  @ApiProperty({ example: 'armar set' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'descripcion' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
