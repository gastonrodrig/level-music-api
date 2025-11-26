import { 
  IsMongoId, 
  IsNotEmpty, 
  IsEnum, 
  IsNumber, 
  IsString, 
  IsOptional,
  ValidateNested,
  IsEmail 
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '../enum';
import { ApiProperty } from '@nestjs/swagger';

class IdentificationDto {
  @ApiProperty({ example: 'DNI', description: 'Tipo de documento', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: '12345678', description: 'Número de documento', required: false })
  @IsString()
  @IsOptional()
  number?: string;
}

class PayerDto {
  @ApiProperty({ example: 'cliente@gmail.com', description: 'Email del pagador' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: () => IdentificationDto, required: false })
  @ValidateNested()
  @Type(() => IdentificationDto)
  @IsOptional()
  identification?: IdentificationDto;
}

export class CreateMercadoPagoPaymentDto {
  // Contexto del sistema
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

  // Datos del pago de Mercado Pago
  @ApiProperty({ example: 166.1, description: 'Monto a pagar' })
  @IsNumber()
  @IsNotEmpty()
  transaction_amount: number;

  @ApiProperty({ example: 'card_token_abc123', description: 'Token de Mercado Pago' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'Pago del evento Level Music', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, description: 'Número de cuotas', required: false })
  @IsNumber()
  @IsOptional()
  installments?: number;

  @ApiProperty({ example: 'visa', description: 'Método de pago', required: false })
  @IsString()
  @IsOptional()
  payment_method_id?: string;

  // Información del pagador
  @ApiProperty({ type: () => PayerDto, description: 'Datos del pagador' })
  @ValidateNested()
  @Type(() => PayerDto)
  @IsNotEmpty()
  payer: PayerDto;
}