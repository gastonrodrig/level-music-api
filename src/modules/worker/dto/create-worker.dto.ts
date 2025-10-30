import { IsNotEmpty, IsMongoId, IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { DocType } from 'src/core/constants/app.constants';

export class CreateWorkerDto {
  @ApiProperty({ example: '682ea84cab5653217969d597', required: true })
  @IsMongoId()
  @IsNotEmpty()
  worker_type_id: string;

  @ApiProperty({ example: 'ramdom@urp.edu.pe', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '999888777', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: DocType, example: 'Dni' })
  @IsEnum(DocType)
  @IsNotEmpty()
  document_type: DocType;

  @ApiProperty({ example: '21354687', required: true })
  @IsString()
  @IsNotEmpty()
  document_number: string;

  @ApiProperty({ example: 'Gaston', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ example: 'Rodriguez', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;
}
