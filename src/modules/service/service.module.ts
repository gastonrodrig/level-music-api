import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schema/service.schema';
import { ServiceType, ServiceTypeSchema } from './schema/service-type.schema';
import { ServiceService } from './services/service.service';
import { ServiceTypeService } from './services/service-type.service';
import { ServiceController } from './controllers/service.controller';
import { ServiceTypeController } from './controllers/service-type.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: ServiceType.name, schema: ServiceTypeSchema },
    ]),
  ],
  providers: [ServiceService, ServiceTypeService],
  controllers: [ServiceController, ServiceTypeController],
})
export class ServiceModule {}
