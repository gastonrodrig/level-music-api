import { IsNotEmpty, IsMongoId, IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { DocType } from 'src/core/constants/app.constants';

export class CreateWorkerDto {
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsNotEmpty()
  worker_type_id: string;

  @ApiProperty({ required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

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
}
