import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schema/service.schema';
import { ServiceType, ServiceTypeSchema } from './schema/service_type.schema';
import { Provider, ProviderSchema } from './schema/provider.schema';
import { ServiceService } from './services/service.service';
import { ServiceTypeService } from './services/service_type.service';
import { ProviderService } from './services/provider.service';
import { ServiceController } from './controllers/service.controller';
import { ServiceTypeController } from './controllers/service_type.controller';
import { ProviderController } from './controllers/provider.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: ServiceType.name, schema: ServiceTypeSchema },
      { name: Provider.name, schema: ProviderSchema },
    ]),
  ],
  providers: [ServiceService, ServiceTypeService, ProviderService],
  controllers: [ServiceController, ServiceTypeController, ProviderController],
})
export class ServiceModule {}
