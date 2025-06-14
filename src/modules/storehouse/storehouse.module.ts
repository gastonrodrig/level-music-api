import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StorehouseMovement, StorehouseMovementSchema } from './schema';
import { StorehouseMovementService } from './services';
import { StorehouseMovementController } from './controllers';
import { Event, EventSchema } from '../event/schema';
import { Resource, ResourceSchema } from '../resources/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StorehouseMovement.name, schema: StorehouseMovementSchema },
      { name: Event.name, schema: EventSchema },
      { name: Resource.name, schema: ResourceSchema }, 
    ])
  ],
  providers: [ StorehouseMovementService],
  controllers: [ StorehouseMovementController],
})
export class StorehouseMovementModule {}
