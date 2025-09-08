import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocType } from '../../../core/constants/app.constants';

export class UpdateClientProfileDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: DocType, example: DocType.DNI, required: false })
  @IsEnum(DocType)
  @IsOptional()
  document_type?: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsString()
  @IsOptional()
  document_number?: string;
}
