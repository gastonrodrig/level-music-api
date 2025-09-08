import { Module } from "@nestjs/common";
import { BullModule } from '@nestjs/bullmq';
import { MailController } from "./controller";
import { MailService } from "./service";
import { MailProcessor, ForgotPasswordProcessor, ContactMailProcessor } from "./processor";

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'temporal-credentials' },
      { name: 'forgot-password' },
      { name: 'contact-mail' },
    ),
  ],
  providers: [
    MailService,
    MailProcessor,
    ForgotPasswordProcessor,
    ContactMailProcessor,
  ],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
