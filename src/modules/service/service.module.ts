import { Module } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schema/service.schema';
import { ServiceType, ServiceTypeSchema } from './schema/service-type.schema';
import { Provider, ProviderSchema } from '../provider/schema/provider.schema';
import { ServiceService } from './services/service.service';
import { ServiceTypeService } from './services/service-type.service';
import { ServiceController } from './controllers/service.controller';
import { ServiceTypeController } from './controllers/service-type.controller';
import { ServiceDetail, ServiceDetailSchema } from './schema/service-detail.schema';
import { ServiceDetailMedia, ServiceDetailMediaSchema } from '../uploads';
import { ServiceDetailService } from './services/service-detail.service';
import { ServiceDetailController } from './controllers/service-detail.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { Connection } from 'mongoose';
import { addProviderHooks, addServiceTypeHooks } from './hook';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: ServiceDetail.name, schema: ServiceDetailSchema },
      { name: ServiceDetailMedia.name, schema: ServiceDetailMediaSchema },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ServiceType.name,
        useFactory: (connection: Connection) => {
          const schema = ServiceTypeSchema;
          addServiceTypeHooks(schema, connection);
          return schema;
        },
        inject: [getConnectionToken()],
      },
      {
        name: Provider.name,
        useFactory: (connection: Connection) => {
          const schema = ProviderSchema;
          addProviderHooks(schema, connection);
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    FirebaseModule
  ],
  providers: [
    ServiceService,
    ServiceTypeService,
    ServiceDetailService
  ],
  controllers: [
    ServiceController,
    ServiceTypeController,
    ServiceDetailController
  ],
})
export class ServiceModule {}