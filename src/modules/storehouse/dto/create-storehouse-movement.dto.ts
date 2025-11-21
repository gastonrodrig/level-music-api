import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { StoreMovementType } from '../enum';
import { LocationType } from 'src/modules/equipments/enum';

export class CreateStorehouseMovementDto {
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsNotEmpty()
  equipment_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsString()
  @IsNotEmpty()
  event_id: Types.ObjectId;

  @ApiProperty({ enum: StoreMovementType, required: false })
  @IsEnum(StoreMovementType)
  @IsNotEmpty()
  movement_type: StoreMovementType;

  @ApiProperty({ enum: LocationType, description: 'Destino del equipo (hacia donde se va)' })
  @IsEnum(LocationType)
  @IsNotEmpty()
  destination: LocationType;

  @ApiProperty({ example: new Date().toISOString() })
  @IsString()
  @IsNotEmpty()
  movement_date: Date;

  @ApiProperty({ example: 'MVT-123456', required: false })
  @IsString()
  code?: string;

  @ApiProperty({ enum: ['Activo','Inactivo'], required: false })
  @IsEnum(['Activo','Inactivo'] as any)
  state?: any;
}
