import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schema/service.schema';
import { ServiceType, ServiceTypeSchema } from './schema/service-type.schema';
import { ServiceService } from './services/service.service';
import { ServiceTypeService } from './services/service-type.service';
import { ServiceController } from './controllers/service.controller';
import { ServiceTypeController } from './controllers/service-type.controller';
import { ServiceDetail, ServiceDetailSchema } from './schema/service-detail.schema';
import { ServiceDetailMedia, ServiceDetailMediaSchema } from '../uploads';
import { ServiceDetailService } from './services/service-detail.service';
import { ServiceDetailController } from './controllers/service-detail.controller';
import { FirebaseModule } from '../firebase/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: ServiceType.name, schema: ServiceTypeSchema },
      { name: ServiceDetail.name, schema: ServiceDetailSchema },
      { name: ServiceDetailMedia.name, schema: ServiceDetailMediaSchema },
    ]),
    FirebaseModule
  ],
  providers: [ServiceService, ServiceTypeService, ServiceDetailService],
  controllers: [ServiceController, ServiceTypeController, ServiceDetailController],
})
export class ServiceModule {}
