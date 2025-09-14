import { PartialType } from "@nestjs/swagger";
import { CreateSalesDocumentsDto } from "./create-sales-documents.dto";

export class UpdateSalesDocumentsDto extends PartialType(CreateSalesDocumentsDto) {}