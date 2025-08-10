import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DocType } from 'src/core/constants/app.constants';

export class CreateClientAdminDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  last_name: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ enum: DocType, example: DocType.DNI, required: false })
  @IsEnum(DocType)
  @IsOptional()
  document_type?: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsString()
  @IsOptional()
  document_number?: string; 
}