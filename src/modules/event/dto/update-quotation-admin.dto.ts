import { PartialType } from '@nestjs/swagger';
import { CreateQuotationAdminDto } from './create-quotation-admin.dto';

export class UpdateQuotationAdminDto extends PartialType(CreateQuotationAdminDto) {}
