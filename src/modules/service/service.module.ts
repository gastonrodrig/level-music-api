import { Module } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { 
  Service,
  ServiceType,
  ServiceDetail,
  ServiceSchema,
  ServiceTypeSchema,
  ServiceDetailSchema,
} from './schema';
import { 
  ServiceService,
  ServiceTypeService,
  ServiceDetailService
} from './services';
import {
  ServiceController,
  ServiceTypeController,
  ServiceDetailController
} from './controllers';
import { 
  ServiceDetailMedia, 
  ServiceDetailMediaSchema 
} from '../uploads';
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
        { name: ServiceDetailMedia.name, schema: ServiceDetailMediaSchema },
        { name: Provider.name, schema: ProviderSchema }
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
    ServiceDetailService
  ],
  controllers: [
    ServiceController,
    ServiceTypeController,
    ServiceDetailController
  ],
})
export class ServiceModule {}
