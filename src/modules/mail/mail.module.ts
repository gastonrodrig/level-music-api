  import { Module } from "@nestjs/common";
  import { BullModule } from '@nestjs/bullmq';
  import { MailController } from "./controller";
  import { MailService } from "./service";
  import { MailProcessor, ForgotPasswordProcessor } from "./processor";
  import { MongooseModule } from "@nestjs/mongoose";
  import { EventSchema,Event, AssignationSchema, Assignation } from "../event/schema";
  import { QuotationReadyProcessor } from "./processor/quotation-ready.processor";

  @Module({
    imports: [
      BullModule.registerQueue(
        { name: 'temporal-credentials' },
        { name: 'forgot-password' },
        { name: 'quotation-ready' },  
        { name: 'activation-clicks' }
      ),
      MongooseModule.forFeature([
        { name: Event.name, schema: EventSchema },
        { name: Assignation.name, schema: AssignationSchema },
      ]),
    ],
    providers: [
      MailService,
      MailProcessor,
      ForgotPasswordProcessor,
      QuotationReadyProcessor,
    ],
    exports: [MailService],
    controllers: [MailController],
  })
  export class MailModule {}
