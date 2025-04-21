import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsOptional, IsNumber } from 'class-validator';
import { StatusType } from '../enum/statusType';
import { PlaceType } from '../enum/placeType';
import { Types } from 'mongoose';
import { Type } from 'class-transformer'; // 

export class CreateEventDto {
    @ApiProperty({ example: 'Nombre del evento', required: true })
    @IsString()
    @IsOptional()
    name: string;

    @ApiProperty({ example: 'Descripcion del evento', required: true })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({ example: '2023-12-31T23:59:59.000Z', required: true })
    @IsDate()
    @Type(() => Date)
    date: Date;

    @ApiProperty({ example: '18:00 - 23:00', required: true })
    @IsString()
    timeRange: string;

    @ApiProperty({ example: 100, required: false })
    @IsOptional()
    @IsNumber()
    attendeesCount?: number;

    @ApiProperty({ example: 'Calle Falsa 123', required: false })
    @IsOptional()
    @IsString()
    exactAddress?: string;

    @ApiProperty({ example: 'Cerca del parque central', required: false })
    @IsOptional()
    @IsString()
    locationReference?: string;

    @ApiProperty({ example: 'Abierto', enum: PlaceType, required: true })
    @IsString()
    placeType: PlaceType;

    @ApiProperty({ example: 500, required: false })
    @IsOptional()
    @IsNumber()
    placeSize?: number;

    @ApiProperty({ type: Types.ObjectId, example: '63f1b2c4e4b0d5a1c8f9e7a6', required: true })
    @IsString()
    @IsOptional()
    userId: Types.ObjectId;

    @ApiProperty({ example: '63f1b2c4e4b0d5a1c8f9e7a7', required: true })
    @IsString()
    eventTypeId: string;

    @ApiProperty({ example: 'Pendiente', enum: StatusType, required: true })
    @IsString()
    state: StatusType;

    @ApiProperty({ example: 1500.50, required: false })
    @IsOptional()
    @IsNumber()

    finalPrice?: number;

}