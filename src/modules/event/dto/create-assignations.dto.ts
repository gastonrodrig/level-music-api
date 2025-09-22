import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { DayOfWeek, EquipmentType } from '../enum';
import { Types } from 'mongoose';

export class CreateAssignationDto {
  @ApiProperty({ example: 'Disponible desde', required: true })
  @IsString()
  @IsNotEmpty()
  available_from: string;

  @ApiProperty({ example: 'Disponible hasta', required: true })
  @IsString()
  @IsNotEmpty()
  available_to: string;

  @ApiProperty({ example: DayOfWeek.LUNES, enum: DayOfWeek, required: false })
  @IsEnum(DayOfWeek)
  @IsOptional()
  day_of_week?: DayOfWeek;

  @ApiProperty({ example: EquipmentType.EQUIPO_DE_LUZ, enum: EquipmentType, required: false })
  @IsEnum(EquipmentType)
  @IsOptional()
  equipment_type?: EquipmentType;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  event: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  worker: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  equipment_id: Types.ObjectId;
}
