import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Estado } from '../../core/constants/app.constants';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uid: string;
  
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @ApiProperty()
  @IsEnum(Estado)
  @IsNotEmpty()
  estado: Estado;
} 