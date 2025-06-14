import { Module } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Provider, ProviderSchema } from './schema';
import { ProviderService } from './services';
import { ProviderController } from './controllers';
import { addProviderHooks } from './hooks';
import { Service, ServiceSchema } from '../service/schema';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
    ]),

    MongooseModule.forFeatureAsync([
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
  ],
  providers: [ProviderService],
  controllers: [ProviderController],
})
export class ProviderModule {}
