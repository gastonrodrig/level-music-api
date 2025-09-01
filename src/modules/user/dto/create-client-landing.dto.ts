import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocType, Estado, Roles } from '../../../core/constants/app.constants';

export class CreateClientLandingDto {
  @ApiProperty({ example: 'auth_id_example' })
  @IsString()
  @IsOptional()
  auth_id: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  @IsString()
  @IsOptional()
  profile_picture?: string;
}
