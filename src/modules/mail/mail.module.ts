import { Module } from "@nestjs/common";
import { BullModule } from '@nestjs/bullmq';
import { MailController } from "./controller";
import { MailService } from "./service";
import { MailProcessor, ForgotPasswordProcessor } from "./processor";

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'temporal-credentials' },
      { name: 'forgot-password' },
    ),
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
