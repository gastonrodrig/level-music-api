import { IsNotEmpty, IsString, IsEnum, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Estado, DocType } from 'src/core/constants/app.constants';

export class UpdateWorkerDto {
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
  @IsEnum(Estado)
  status: Estado;
}
