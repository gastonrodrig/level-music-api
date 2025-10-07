import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard } from './guards';
import { PublicController } from './controllers';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivationTokenService } from './services';
import { ActivationToken, ActivationTokenSchema } from './schema';
import { Event, EventSchema } from 'src/modules/event/schema';
import { User, UserSchema } from 'src/modules/user/schema';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'activation-clicks' }),
    MongooseModule.forFeature([
      { name: ActivationToken.name, schema: ActivationTokenSchema },
      { name: Event.name, schema: EventSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    { provide: APP_GUARD, useClass: FirebaseAuthGuard },
    ActivationTokenService,
  ],
  controllers: [PublicController],
  exports: [ActivationTokenService],
})
export class AuthModule {}
