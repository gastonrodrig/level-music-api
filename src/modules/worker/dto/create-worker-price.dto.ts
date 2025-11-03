import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkerPriceDto {
  @ApiProperty({ example: '652a0cba1f29a2b9a1d4b123', description: 'ID del trabajador' })
  @IsMongoId()
  worker_id: string;

  @ApiProperty({ example: 120.50, description: 'Precio de referencia por hora' })
  @IsString()
  @IsNotEmpty()
  reference_price: number;
}