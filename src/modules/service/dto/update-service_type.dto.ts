import { PartialType } from "@nestjs/swagger";
import { CreateServiceTypeDto } from "./create-service_type.dto";

export class UpdateServiceTypeDto extends PartialType(CreateServiceTypeDto) {}