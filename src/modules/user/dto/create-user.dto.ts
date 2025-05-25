import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocType, Estado, Roles } from '../../../core/constants/app.constants';

export class CreateUserDto {
  @ApiProperty({ example: 'auth_id_example' })
  @IsString()
  @IsOptional()
  auth_id: string;

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

  @ApiProperty({ enum: Roles, example: Roles.ADMIN })
  @IsEnum(Roles)
  @IsNotEmpty()
  role: Roles;

  @ApiProperty({ enum: Estado, example: Estado.ACTIVO })
  @IsEnum(Estado)
  @IsOptional()
  status?: Estado;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  needs_password_change?: boolean;

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  @IsString()
  @IsOptional()
  profile_picture?: string;
}
