import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { EventModule } from './modules/event/event.module';
import { AuthModule } from './auth/auth.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { WorkerModule } from './modules/worker/worker.module';
import { ServiceModule } from './modules/service/service.module';
import { StorehouseMovementModule } from './modules/storehouse_movement/StorehouseMovement.module';

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
    AuthModule,
    ServiceModule,
    EquipmentModule,
    WorkerModule,
    StorehouseMovementModule,
    
  ],
  providers: [],
  controllers: []
})
export class AppModule {}
