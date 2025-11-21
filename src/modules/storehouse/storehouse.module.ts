import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StorehouseMovement, StorehouseMovementSchema } from './schema';
import { StorehouseMovementService } from './services';
import { StorehouseMovementController } from './controllers';
import { Event, EventSchema, Assignation, AssignationSchema } from '../event/schema';
import { Equipment, EquipmentSchema } from '../equipments/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StorehouseMovement.name, schema: StorehouseMovementSchema },
      { name: Event.name, schema: EventSchema },
      { name: Equipment.name, schema: EquipmentSchema },
      { name: Assignation.name, schema: AssignationSchema },
    ])
  ],
  providers: [ StorehouseMovementService],
  controllers: [ StorehouseMovementController],
})
export class StorehouseMovementModule {}
