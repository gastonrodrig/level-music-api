import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { DocType } from '../../../core/constants/app.constants';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExtraDataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  last_name: string;

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
