import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsMongoId,
  IsEnum,
  IsNumber,
  IsString,
  IsInt,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from '../enum';

export class CreateSalesDocumentsDetailsDto {
 @ApiProperty({ example: 'Nombre', required: false })
  @IsString()
  @IsOptional()
  name: string;
  
  @ApiProperty({ example: 'Descripción', required: false })
  @IsString()
  @IsOptional()
  description: string;
  
  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  quantity?: number;
  
  @ApiProperty({ example: 500, required: false })
  @IsNumber()
  @IsOptional()
  unit_price?: number;

  @ApiProperty({ example: 500, required: false })
  @IsNumber()
  @IsOptional()
  total_price?: number;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  sale_document: Types.ObjectId;


}
