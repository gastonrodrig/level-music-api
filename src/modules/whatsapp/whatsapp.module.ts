import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schema';
import { WhatsAppController } from './controllers';
import { WhatsAppProcessor } from './processors';
import { WhatsAppService } from './services';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'whatsapp-notifications',
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [WhatsAppService, WhatsAppProcessor],
  controllers: [WhatsAppController],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}