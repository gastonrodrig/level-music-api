import { PartialType } from "@nestjs/swagger";
import { CreatePaymentSchedulesDto } from "./create-payment-schedules.dto";

export class UpdatePaymentSchedulesDto extends PartialType(CreatePaymentSchedulesDto) {}