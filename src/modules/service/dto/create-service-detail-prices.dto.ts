import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateServicesDetailsPricesDto {
  @ApiProperty({ example: 1500.5, required: true })
  @IsNumber()
  @IsNotEmpty()
  reference_detail_price: number;

  @ApiProperty({ example: '2025-10-01T12:00:00.000Z', required: true })
  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty({
    example: '2025-10-01T20:00:00.000Z',
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  end_date?: Date | null;

  @ApiProperty({
    example: '64f1c7e1234567890abcde12',
    required: true,
  })
  @IsMongoId()
  @IsNotEmpty()
  service_detail_id: string;

  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  detail_number?: number;
}
