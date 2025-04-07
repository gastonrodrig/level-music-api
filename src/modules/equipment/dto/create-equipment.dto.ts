import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EquipmentType } from '../enum/equipmentType';
import { StateType } from '../enum/stateType';
import { LocationType } from '../enum/locationType';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Nombre del equipo', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Descripcion del equipo', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
  enum: EquipmentType,
  example: EquipmentType.OTROS,
  required: false,
  })
  @IsEnum(EquipmentType)
  @IsOptional()
  equipment_type?: EquipmentType;

  @ApiProperty({ example: '011', required: false })
  @IsString()
  @IsOptional()
  serial_number?: string;

  @ApiProperty({ enum: StateType, example: StateType.EN_USO, required: false })
  @IsEnum(StateType)
  @IsOptional()
  state?: StateType;

  @ApiProperty({
  enum: LocationType,
  example: LocationType.ALMACEN,
  required: false,
  })
  @IsEnum(LocationType)
  @IsOptional()
  location?: LocationType;
}
