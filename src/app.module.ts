import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { ClientModule } from './client/client.module';
import { AuthModule } from './auth/auth.module';

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
    UserModule,
    EventModule,
    ClientModule,
    AuthModule
  ]
})
export class AppModule {}
