import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentType, PaymentMethod } from '../enum';

export class CreateManualPaymentDto {
  @IsMongoId()
  @IsNotEmpty()
  event_id: string;

  @IsMongoId()
  @IsNotEmpty()
  schedule_id: string;

  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @IsEnum(PaymentType)
  @IsNotEmpty()
  payment_type: PaymentType;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method: PaymentMethod;

  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsString()
  transaction_number?: string;
}
