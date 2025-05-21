import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { EventModule } from './modules/event/event.module';
import { AuthModule } from './auth/auth.module';
import { ResourceModule } from './modules/resources/resource.module';
import { WorkerModule } from './modules/worker/worker.module';
import { ServiceModule } from './modules/service/service.module';
import { StorehouseMovementModule } from './modules/storehouse-movement/storehouse-movement.module';
import { ProviderModule } from './modules/provider/provider.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    ResourceModule,
    WorkerModule,
    StorehouseMovementModule,
    ProviderModule
  ],
  providers: [],
  controllers: []
})
export class AppModule {}
