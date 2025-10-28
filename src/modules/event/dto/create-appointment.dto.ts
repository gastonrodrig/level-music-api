import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MeetingType } from '../enum';
import { DocType } from 'src/core/constants/app.constants';
import { ClientType } from 'src/modules/user/enum';

export class CreateAppointmentDto {
  @ApiProperty({ example: MeetingType.VIRTUAL, enum: MeetingType, required: true })
  @IsEnum(MeetingType)
  @IsNotEmpty()
  meeting_type: MeetingType;

  @ApiProperty({ example: '2025-11-07', required: true })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ example: '14:00', required: true })
  @IsString()
  @IsNotEmpty()
  hour: string;

  @ApiProperty({ example: 5, required: true })
  @IsNumber()
  @IsNotEmpty()
  attendees_count: number;

  @ApiProperty({ example: ClientType.PERSONA, enum: ClientType })
  @IsEnum(ClientType)
  @IsNotEmpty()
  client_type: ClientType;

  @ApiProperty({ example: 'Gaston', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ example: 'Rodriguez', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ example: 'Sony Productions', required: false })
  @IsOptional()
  @IsString()
  company_name?: string;

  @ApiProperty({ example: 'Nicholas Reyes', required: false })
  @IsOptional()
  @IsString()
  contact_person?: string;

  @ApiProperty({ example: '202111913@urp.edu.pe', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '989160593', required: true })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ enum: DocType, example: 'Dni' })
  @IsEnum(DocType)
  @IsNotEmpty()
  document_type: DocType;

  @ApiProperty({ example: '76588318', required: true })
  @IsString()
  @IsNotEmpty()
  document_number: string;

  @ApiProperty({ example: '68b9c17b445a8108efdf8d43', required: false })
  @IsOptional()
  @IsString()
  user_id?: string;
}
