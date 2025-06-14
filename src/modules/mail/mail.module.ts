import { Module } from "@nestjs/common";
import { MailController } from "./controller";
import { MailService } from "./service";

@Module({
  providers: [MailService],
  controllers: [MailController],
})
export class MailModule {}
