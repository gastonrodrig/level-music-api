import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsOptional, IsNumber, IsMongoId, IsEnum, IsNotEmpty } from 'class-validator';
import { StatusType, PlaceType, StatusReprogramingsType } from '../enum';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class CreateReprogramingsDto {

  @ApiProperty({ example: '2023-12-31T23:59:59.000Z', required: true })
  @IsDate()
  @Type(() => Date)
  previousDate: Date;

  @ApiProperty({ example: 'Nombre del evento', required: true })
  @IsString()
  @IsNotEmpty()
  previousTimeRange: string;

  @ApiProperty({ example: '2023-12-31T23:59:59.000Z', required: true })
  @IsDate()
  @Type(() => Date)
  newDate: Date;

  @ApiProperty({ example: '18:00 - 23:00', required: true })
  @IsString()
  @IsNotEmpty()
  newTimeRange: string;

  @ApiProperty({ example: 'Descripcion del evento', required: true })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ example: 'Pendiente', enum: StatusReprogramingsType, required: true })
  @IsEnum(StatusReprogramingsType)
  @IsNotEmpty()
  status: StatusReprogramingsType;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  event_id: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  user_id: Types.ObjectId;

}