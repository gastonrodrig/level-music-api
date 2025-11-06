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
  ServiceMedia,
  ServiceMediaSchema,
} from './schema';
import { 
  ServiceDetailService,
  ServiceService,
  ServiceTypeService,
  ServicesDetailsPricesService,
  MediaServiceService
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
    MediaServiceService,
    
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
