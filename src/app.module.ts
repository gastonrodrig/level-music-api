import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { UserModule } from './modules/user/user.module';
import { EventModule } from './modules/event/event.module';
import { AuthModule } from './auth/auth.module';
import { EquipmentModule } from './modules/equipments/equipment.module';
import { WorkerModule } from './modules/worker/worker.module';
import { ServiceModule } from './modules/service/service.module';
import { StorehouseMovementModule } from './modules/storehouse/storehouse.module';
import { ProviderModule } from './modules/provider/provider.module';
import { MailModule } from './modules/mail/mail.module';
import { PaymentModule } from './modules/payment/payment.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        autoCreate: true,
        autoIndex: true
      }),
      inject: [ConfigService],
    }),
    MailModule,
    UserModule,
    EventModule,
    AuthModule,
    ServiceModule,
    EquipmentModule,
    WorkerModule,
    StorehouseMovementModule,
    ProviderModule,
    PaymentModule,
    WhatsAppModule
  ],
  providers: [],
  controllers: []
})
export class AppModule {}
