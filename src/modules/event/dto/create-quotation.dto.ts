import { ApiProperty } from '@nestjs/swagger';
import { IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEventDto } from '.';
import { ResourceType } from '../enum';
import { DocType } from 'src/core/constants/app.constants';
import { ClientType } from 'src/modules/user/enum';

class AssignationRequestDto {
  @ApiProperty({ enum: ResourceType })
  @IsEnum(ResourceType)
  resource_type: ResourceType;

  @ApiProperty()
  @IsMongoId()
  resource_id: string;

  @ApiProperty()
  @IsNumber()
  hours: number;

  @ApiProperty()
  @IsNumber()
  hourly_rate: number;

  @ApiProperty()
  @IsDateString()
  available_from: Date;

  @ApiProperty()
  @IsDateString()
  available_to: Date;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  payment_percentage_required?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity_required?: number;
}

export class CreateQuotationDto extends IntersectionType(CreateEventDto) {
  @ApiProperty({ type: [AssignationRequestDto] })
  @ValidateNested({ each: true })
  @Type(() => AssignationRequestDto)
  assignations: AssignationRequestDto[];

  @ApiProperty({ example: ClientType.PERSONA, enum: ClientType })
  @IsEnum(ClientType)
  @IsNotEmpty()
  client_type: ClientType;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ example: 'ACME S.A.C.' })
  @IsString()
  @IsOptional()
  company_name?: string;

  @ApiProperty({ example: 'Carlos Pérez' })
  @IsString()
  @IsOptional()
  contact_person?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '987654321' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Dni', enum: DocType })
  @IsEnum(DocType)
  @IsOptional()
  document_type?: DocType;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsOptional()
  document_number?: string;
}
