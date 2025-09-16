import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { ClientType } from 'src/modules/user/enum';
import { DocType } from '../../../core/constants/app.constants';

export class ClientInfoDto {
  @ApiProperty({ example: 'PERSONA', enum: ClientType })
  @IsEnum(ClientType)
  @IsNotEmpty()
  client_type: ClientType;

  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({ example: 'ACME S.A.C.' })
  @IsString()
  @IsOptional()
  company_name?: string;

  @ApiPropertyOptional({ example: 'Carlos Pérez' })
  @IsString()
  @IsOptional()
  contact_person?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '987654321' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Dni', enum: DocType })
  @IsEnum(DocType)
  @IsOptional()
  document_type?: DocType;

  @ApiPropertyOptional({ example: '12345678' })
  @IsString()
  @IsOptional()
  document_number?: string;
}
