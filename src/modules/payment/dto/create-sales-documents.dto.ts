import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsMongoId,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from '../enum';

export class CreateSalesDocumentsDto {
  @ApiProperty({ example: '121211123', required: false })
  @IsString()
  @IsOptional()
  sale_document_number: string;
  @ApiProperty({ example: 500, required: false })
  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @ApiProperty({ enum: Type, example: Type.BOLETA })
  @IsEnum(Type)
  @IsOptional()
  type?: Type;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  event: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  user: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  schedule: Types.ObjectId;
}
