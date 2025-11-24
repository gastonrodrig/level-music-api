import {
  IsMongoId,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType, PaymentMethod } from '../enum';
import { ApiProperty } from '@nestjs/swagger';

export class ManualPaymentItemDto {
  @ApiProperty({ example: 'Yape', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method: PaymentMethod;

  @ApiProperty({ example: 300 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'YP123456', required: false })
  @IsOptional()
  @IsString()
  operation_number?: string;
}

export class CreateManualPaymentDto {
  @ApiProperty({ example: 'Parcial', enum: PaymentType })
  @IsEnum(PaymentType)
  @IsNotEmpty()
  payment_type: PaymentType;

  @ApiProperty({ example: '68fa352e038345fc4290f084' })
  @IsMongoId()
  @IsNotEmpty()
  event_id: string;

  @ApiProperty({ example: '68b9c17b445a8108efdf8d43' })
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    type: [ManualPaymentItemDto],
    description: 'Lista de pagos manuales',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManualPaymentItemDto)
  @IsNotEmpty()
  payments: ManualPaymentItemDto[];
}
