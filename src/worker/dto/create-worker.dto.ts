import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkerDto {
  @ApiProperty({
    example: '67ea1b5eec23135d02f6d11c',
    description: 'ID del tipo de trabajador',
  })
  @IsMongoId()
  @IsNotEmpty()
  worker_type_id: string;

  @ApiProperty({
    example: true,
    description: 'Disponibilidad del trabajador para eventos',
  })
  @IsBoolean()
  @IsNotEmpty()
  availability: boolean;
}
