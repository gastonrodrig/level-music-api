import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from 'class-validator';
import { IsString } from "class-validator";
import { CategoryType } from "../enum/categoryType";


export class CreateEventTypeDto {
 


    @ApiProperty({example: 'Descripcion del tipo de evento', required: false})
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({example: 'vivo', required: false})
    @IsString()
    @IsOptional()
    event_type?: string;

    @ApiProperty({example: 'Vivo', enum: CategoryType, required: false})
    @IsString()
    @IsOptional()
    category?: CategoryType;
}