import { PartialType } from '@nestjs/swagger';
import { CreateQuotationDto } from './';

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {}
