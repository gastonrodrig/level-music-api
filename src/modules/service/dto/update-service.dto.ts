import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsEnum
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Estado } from 'src/core/constants/app.constants';

class UpdateServiceDetailData {
  @ApiPropertyOptional({ description: 'ID del detalle (solo si ya existe)' })
  @IsOptional()
  @IsMongoId()
  _id?: string;

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
  @Type(() => Number)
  @IsNumber()
  ref_price?: number;

  @ApiPropertyOptional({
    description: 'Estado del detalle',
    enum: ['Activo', 'Inactivo'],
    example: 'Activo',
  })
  @IsOptional()
  @IsEnum(Estado)
  status?: Estado;
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

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @ApiPropertyOptional({
    description: 'IDs de fotos a eliminar del detalle',
    type: [String],
    example: ['654f3e2f...', '654f3e99...'],
  })
  @IsOptional()
  @IsArray()
  photos_to_delete?: string[];
}
