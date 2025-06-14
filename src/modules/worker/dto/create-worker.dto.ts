import { IsNotEmpty, IsMongoId, IsString, IsEnum, IsOptional, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Estado, DocType } from 'src/core/constants/app.constants';

export class CreateWorkerDto {
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsNotEmpty()
  worker_type_id: string;

  @ApiProperty({ required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: DocType, required: false })
  @IsOptional()
  document_type?: DocType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  document_number?: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ required: true })
  @IsEnum(Estado)
  status: Estado;
}
