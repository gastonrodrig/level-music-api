import { Module } from "@nestjs/common";
import { BullModule } from '@nestjs/bullmq';
import { MailController } from "./controller";
import { MailService } from "./service";
import { MailProcessor, ForgotPasswordProcessor, AppointmentReadyProcessor } from "./processor";
import { MongooseModule } from "@nestjs/mongoose";
import { EventSchema,Event, AssignationSchema, Assignation } from "../event/schema";
import { QuotationReadyProcessor } from "./processor/quotation-ready.processor";
import { ActivationClickProcessor } from "./processor/activation-click.processor";
import { User, UserSchema } from "../user/schema";
import { FirebaseModule } from "../firebase/firebase.module";
import { ActivationTokenService } from "src/auth/services";
import { ActivationToken, ActivationTokenSchema } from "src/auth/schema";


  @Module({
    imports: [
      BullModule.registerQueue(
        { name: 'temporal-credentials' },
        { name: 'forgot-password' },
        { name: 'quotation-ready' },  
        { name: 'activation-clicks' },
        { name: 'appointment-ready' }
      ),
      MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: Event.name, schema: EventSchema },
        { name: Assignation.name, schema: AssignationSchema },
        { name: ActivationToken.name, schema: ActivationTokenSchema }
      ]),
      FirebaseModule,
    ],
    providers: [
      MailService,
      MailProcessor,
      ForgotPasswordProcessor,
      QuotationReadyProcessor,
      ActivationClickProcessor,
      AppointmentReadyProcessor,
      ActivationTokenService,
    ],
    exports: [MailService],
    controllers: [MailController],
  })
  export class MailModule {}
