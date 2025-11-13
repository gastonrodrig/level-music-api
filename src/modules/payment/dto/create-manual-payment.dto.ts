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

export class ManualPaymentItemDto {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method: PaymentMethod;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsString()
  operation_number?: string;
}

export class CreateManualPaymentDto {
  @IsEnum(PaymentType)
  @IsNotEmpty()
  payment_type: PaymentType;

  @IsMongoId()
  @IsNotEmpty()
  event_id: string;

  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManualPaymentItemDto)
  payments: ManualPaymentItemDto[];
}
