import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDetailInput {
  @ApiProperty({
    description: 'Atributos dinámicos (objeto flexible con campos específicos)',
    example: { duration: 2, price_per_hour: 100 },
  })
  @IsNotEmpty()
  details: any;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Type(() => Number)
  ref_price: number;
}

export class CreateServiceDto {
  @ApiProperty({ example: '64f1c7e...' })
  @IsMongoId()
  provider_id: string;

  @ApiProperty({ example: '64f1c7e...' })
  @IsMongoId()
  service_type_id: string;

  @ApiProperty({
    type: [CreateServiceDetailInput],
    description: 'Lista de detalles para el servicio',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceDetailInput)
  serviceDetails: CreateServiceDetailInput[];
}