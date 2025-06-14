import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ResourceType } from '../enum';

export class UpdateResourceDto {
  @ApiProperty({ example: 'Nombre del recurso' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Descripcion del recurso' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ResourceType, example: ResourceType.SONIDO })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  resource_type: ResourceType;
}
