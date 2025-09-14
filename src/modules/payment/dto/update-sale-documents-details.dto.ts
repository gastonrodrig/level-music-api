import { PartialType } from "@nestjs/swagger";
import { CreateSalesDocumentsDetailsDto } from "./create-sales-documents-details.dto";

export class UpdateSalesDocumentsDetailsDto extends PartialType(CreateSalesDocumentsDetailsDto) {}