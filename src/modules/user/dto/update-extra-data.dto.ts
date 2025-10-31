import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { DocType } from '../../../core/constants/app.constants';
import { ApiProperty } from '@nestjs/swagger';
import { ClientType } from '../enum';

export class UpdateExtraDataDto {
  @ApiProperty({ enum: ClientType, example: ClientType.PERSONA })
  @IsEnum(ClientType)
  @IsNotEmpty()
  client_type: string;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
  first_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  last_name: string;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
  company_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  contact_person: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsEnum(DocType)
  @IsNotEmpty()
  document_type: DocType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  document_number: string;
}
