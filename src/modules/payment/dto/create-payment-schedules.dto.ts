import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreatePaymentSchedulesDto {
  @ApiProperty({
    example: '2025-10-17',
    description: 'Fecha del pago parcial',
  })
  @IsDateString()
  @IsNotEmpty()
  partial_payment_date: string;

  @ApiProperty({
    example: '2025-11-06',
    description: 'Fecha del pago final',
  })
  @IsDateString()
  @IsNotEmpty()
  final_payment_date: string;

  @ApiProperty({
    example: 1200,
    description: 'Monto del pago parcial',
  })
  @IsOptional()
  @IsNumber()
  partial_amount?: number;

  @ApiProperty({
    example: 2800,
    description: 'Monto del pago final',
  })
  @IsOptional()
  @IsNumber()
  final_amount?: number;

  @ApiProperty({
    example: '6710a2ff6b5c7d7e28c7a123',
    description: 'ID del evento asociado',
  })
  @IsMongoId()
  @IsNotEmpty()
  event_id: Types.ObjectId;
}
