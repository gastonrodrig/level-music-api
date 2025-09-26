import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer/types/decorators/type.decorator';
import { PaymentType, Status } from '../enum';

export class CreatePaymentSchedulesDto {
  @ApiProperty({ enum: PaymentType, example: PaymentType.PARCIAL })
  @IsEnum(PaymentType)
  @IsOptional()
  payment_type?: PaymentType;

  @ApiProperty({ example: '2023-12-31T23:59:59.000Z', required: true })
  @IsDate()
  @Type(() => Date)
  due_date: Date;

  @ApiProperty({ example: 500, required: false })
  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @ApiProperty({ enum: Status, example: Status.PENDIENTE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsOptional()
  event: Types.ObjectId;
}
