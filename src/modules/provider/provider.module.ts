import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Provider, ProviderSchema } from './schema/provider.schema';
import { ProviderService } from './services/provider.service';
import { ProviderController } from './controller/provider.controller';
import { Service, ServiceSchema } from '../service/schema/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Provider.name, schema: ProviderSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  providers: [ProviderService],
  controllers: [ProviderController],
})
export class ProviderModule {}
