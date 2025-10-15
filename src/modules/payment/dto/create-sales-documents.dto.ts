// import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsOptional,
//   IsMongoId,
//   IsEnum,
//   IsNumber,
//   IsString,
// } from 'class-validator';
// import { Types } from 'mongoose';
// import { PaymentType } from '../enum';

// export class CreateSalesDocumentsDto {
//   @ApiProperty({ example: '121211123', required: false })
//   @IsString()
//   @IsOptional()
//   sale_document_number: string;
//   @ApiProperty({ example: 500, required: false })
//   @IsNumber()
//   @IsOptional()
//   total_amount?: number;

//   @ApiProperty({ enum: PaymentType, example: PaymentType.PARCIAL })
//   @IsEnum(PaymentType)
//   @IsOptional()
//   type?: PaymentType;

//   @ApiProperty({ type: Types.ObjectId, required: true })
//   @IsMongoId()
//   @IsOptional()
//   event: Types.ObjectId;

//   @ApiProperty({ type: Types.ObjectId, required: true })
//   @IsMongoId()
//   @IsOptional()
//   user: Types.ObjectId;

//   @ApiProperty({ type: Types.ObjectId, required: true })
//   @IsMongoId()
//   @IsOptional()
//   schedule: Types.ObjectId;
// }
