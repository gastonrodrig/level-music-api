import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ResourceType, StatusType, LocationType } from '../enum';

export class CreateResourceDto {
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

  @ApiProperty({ example: '1293219313' })
  @IsString()
  @IsNotEmpty()
  serial_number: string;

  @ApiProperty({ enum: StatusType, example: StatusType.EN_USO })
  @IsEnum(StatusType)
  @IsNotEmpty()
  status: StatusType;

  @ApiProperty({ enum: LocationType, example: LocationType.ALMACEN })
  @IsEnum(LocationType)
  @IsNotEmpty()
  location: LocationType;
}
