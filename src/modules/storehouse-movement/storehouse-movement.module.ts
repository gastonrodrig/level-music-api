
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Storehouse_Movement,
  Storehouse_MovementSchema,
} from './schema/storehouse-movement.schema';
import { StorehouseMovementService } from './services/storehouse-movement.service';
import { StorehouseMovementController } from './controllers/storehouse-movement.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Storehouse_Movement.name, schema: Storehouse_MovementSchema }
    ])
  ],
  providers: [ StorehouseMovementService],
  controllers: [ StorehouseMovementController],
})
export class StorehouseMovementModule {}
