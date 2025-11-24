import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { IssueCategory } from '../enum/Issue-Category.enum';


export class PaymentIssueDto {
  @ApiProperty({
    description: 'ID del pago con problema',
    example: '68fa352e038345fc4290f084',
  })
  @IsNotEmpty()
  @IsString()
  payment_id: string;

  @ApiProperty({
    description: 'Categoría del problema',
    enum: IssueCategory,
    example: 'amount_incorrect',
  })
  @IsNotEmpty()
  @IsEnum(IssueCategory)
  category: IssueCategory;

  @ApiProperty({
    description: 'Comentarios adicionales',
    example: 'El monto no coincide con lo acordado',
    required: false,
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class ReportPaymentIssuesDto {
  @ApiProperty({
    description: 'ID del evento',
    example: '68fa352e038345fc4290f084',
  })
  @IsNotEmpty()
  @IsString()
  event_id: string;

  @ApiProperty({
    description: 'Lista de problemas con los pagos',
    type: [PaymentIssueDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentIssueDto)
  issues: PaymentIssueDto[];
}