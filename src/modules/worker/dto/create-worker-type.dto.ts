import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Estado } from 'src/core/constants/app.constants';

export class CreateWorkerTypeDto {
  @ApiProperty({ example: 'Sonidista' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: Estado, example: Estado.ACTIVO })
  @IsEnum(Estado)
  @IsOptional()
  status?: Estado;
}
