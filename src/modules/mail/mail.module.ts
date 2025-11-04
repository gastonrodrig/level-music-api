import { Module } from "@nestjs/common";
import { BullModule } from '@nestjs/bullmq';
import { MailController } from "./controller";
import { MailService } from "./service";
import { MailProcessor, ForgotPasswordProcessor, AppointmentReadyProcessor } from "./processor";
import { MongooseModule } from "@nestjs/mongoose";
import { EventSchema,Event, AssignationSchema, Assignation } from "../event/schema";
import { QuotationReadyProcessor } from "./processor/quotation-ready.processor";
import { User, UserSchema } from "../user/schema";
import { FirebaseModule } from "../firebase/firebase.module";

  @Module({
    imports: [
      BullModule.registerQueue(
        { name: 'temporal-credentials' },
        { name: 'forgot-password' },
        { name: 'quotation-ready' },  
        { name: 'appointment-ready' }
      ),
      MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: Event.name, schema: EventSchema },
        { name: Assignation.name, schema: AssignationSchema },
      ]),
      FirebaseModule,
    ],
    providers: [
      MailService,
      MailProcessor,
      ForgotPasswordProcessor,
      QuotationReadyProcessor,
      AppointmentReadyProcessor,
    ],
    exports: [MailService],
    controllers: [MailController],
  })
  export class MailModule {}
