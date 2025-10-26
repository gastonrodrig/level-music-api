import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
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
