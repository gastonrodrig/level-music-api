import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateEquipmentPriceDto {
  @ApiProperty({
    example: '652a0cba1f29a2b9a1d4b123',
    description: 'ID del equipo',
  })
  @IsMongoId()
  equipment_id: string;

  @ApiProperty({
    example: 120.5,
    description: 'Precio de referencia por hora/día',
  })
  @IsNumber()
  @IsNotEmpty()
  reference_price: number;
}
