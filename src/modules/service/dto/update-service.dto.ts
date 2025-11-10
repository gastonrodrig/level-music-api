import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateServiceDetailData {
  @ApiProperty({
    description: 'ID del detalle de servicio que se actualiza',
    example: '64f1c7e1234567890abcd124',
  })
  @IsMongoId()
  @IsOptional()
  _id: string;

  @ApiPropertyOptional({
    description: 'Atributos dinámicos específicos de este detalle',
    example: { color: 'Rojo', area_m2: 200 },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  details?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Precio de referencia del detalle',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  ref_price?: number;

  @ApiPropertyOptional({
    description: 'Estado del detalle',
    enum: ['Activo', 'Inactivo'],
    example: 'Activo',
  })
  @IsOptional()
  @IsString()
  status?: 'Activo' | 'Inactivo';

  @ApiPropertyOptional({
    description: 'Número de detalle (1, 2, 3...) para enlazar fotos',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  detail_number?: number;
}

export class UpdateServiceDto {
  @ApiProperty({
    description: 'Lista de detalles del servicio a actualizar',
    type: [UpdateServiceDetailData],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateServiceDetailData)
  serviceDetails: UpdateServiceDetailData[];
}
