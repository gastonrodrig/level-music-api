import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class IdentificationDto {
  @ApiProperty({
    example: 'DNI',
    description: 'Tipo de documento del pagador (DNI, RUC, CE, etc.)',
  })
  @IsOptional()
  type: string;

  @ApiProperty({
    example: '12345678',
    description: 'Número de documento del pagador',
  })
  @IsOptional()
  number: string;
}

class PayerDto {
  @ApiProperty({
    example: 'cliente@gmail.com',
    description: 'Correo electrónico del pagador',
  })
  @IsOptional()
  email: string;

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
    example: 150,
    description: 'Monto total de la transacción en soles (S/)',
  })
  @IsNumber()
  transaction_amount: number;

  @ApiProperty({
    example: '21ddc8d94c83ee89d3c713114dbf92bd',
    description: 'Token generado por el frontend de Mercado Pago',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'Pago del servicio Level Music',
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
    example: 'master',
    description: 'Método de pago seleccionado por el usuario (visa, master, etc.)',
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