import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'user@example.com', description: 'Correo del usuario que solicita el reseteo' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}