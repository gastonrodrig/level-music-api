import { Module } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { 
  Service,
  ServiceType,
  ServiceDetail,
  ServiceSchema,
  ServiceTypeSchema,
  ServiceDetailSchema,
  ServiceDetailPriceSchema,
  ServiceDetailPrice,
} from './schema';
import { 
  ServiceDetailService,
  ServiceMediaService,
  ServiceService,
  ServiceTypeService,
  ServicesDetailsPricesService,
} from './services';
import {
  ServiceController,
  ServiceDetailController,
  ServiceTypeController,
  ServicesDetailsPricesController
} from './controllers';
import { 
  addServiceHooks, 
  addServiceTypeHooks 
} from './hooks';
import { FirebaseModule } from '../firebase/firebase.module';
import { Connection } from 'mongoose';
import { Provider, ProviderSchema } from '../provider/schema';
import { ServiceMedia, ServiceMediaSchema } from '../uploads';

@Module({
  imports: [
    (() => {
      addServiceHooks(ServiceSchema);
      return MongooseModule.forFeature([
        { name: Service.name, schema: ServiceSchema },
        { name: ServiceDetail.name, schema: ServiceDetailSchema },
        { name: Provider.name, schema: ProviderSchema },
        { name: ServiceDetailPrice.name, schema: ServiceDetailPriceSchema },
        { name: ServiceMedia.name, schema: ServiceMediaSchema }
      ]);
    })(),

    MongooseModule.forFeatureAsync([
      {
        name: ServiceType.name,
        useFactory: (connection: Connection) => {
          const schema = ServiceTypeSchema;
          addServiceTypeHooks(schema, connection);
          return schema;
        },
        inject: [getConnectionToken()],
      }
    ]),
    FirebaseModule
  ],
  providers: [
    ServiceService,
    ServiceTypeService,
    ServiceDetailService,
    ServicesDetailsPricesService,
    ServiceMediaService,
  ],
  controllers: [
    ServiceController,
    ServiceTypeController,
    ServiceDetailController,
    ServicesDetailsPricesController
  ],
  exports: [
    MongooseModule
  ],
})
export class ServiceModule {}
