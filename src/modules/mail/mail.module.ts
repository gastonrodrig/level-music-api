import { Module } from "@nestjs/common";
import { BullModule } from '@nestjs/bullmq';
import { MailController } from "./controller";
import { MailService } from "./service";
import { MailProcessor, ForgotPasswordProcessor } from "./processor";
import { MongooseModule } from "@nestjs/mongoose";
import { EventSchema,Event, AssignationSchema, Assignation } from "../event/schema";

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'temporal-credentials' },
      { name: 'forgot-password' },
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
  ],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
