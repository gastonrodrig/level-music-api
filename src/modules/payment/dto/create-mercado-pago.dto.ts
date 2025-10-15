import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsEmail, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class IdentificationDto {
  @ApiProperty({
    example: 'DNI',
    description: 'Tipo de documento del pagador (DNI, RUC, CE, etc.)',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: '12345678',
    description: 'Número de documento del pagador',
  })
  @IsString()
  number: string;
}

class PayerDto {
  @ApiProperty({
    example: 'cliente@gmail.com',
    description: 'Correo electrónico del pagador',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Carlos',
    description: 'Nombre del pagador',
    required: false,
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    type: () => IdentificationDto,
    description: 'Datos de identificación del pagador',
  })
  @ValidateNested()
  @Type(() => IdentificationDto)
  identification: IdentificationDto;
}

export class CreateMercadoPagoDto {
  @ApiProperty({
    example: 250.5,
    description: 'Monto total de la transacción en soles (S/)',
  })
  @IsNumber()
  transaction_amount: number;

  @ApiProperty({
    example: 'a3d7d1f5b3f1b7e8f1f7f3a1f',
    description: 'Token generado por el frontend de Mercado Pago',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'Pago del evento Fiesta Corporativa Lima 2025',
    description: 'Descripción del pago',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 1,
    description: 'Número de cuotas (normalmente 1 si es pago único)',
  })
  @IsNumber()
  installments: number;

  @ApiProperty({
    example: 'visa',
    description: 'Método de pago seleccionado por el usuario',
  })
  @IsString()
  payment_method_id: string;

  @ApiProperty({
    type: () => PayerDto,
    description: 'Información del pagador',
  })
  @ValidateNested()
  @Type(() => PayerDto)
  payer: PayerDto;
}
