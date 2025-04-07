
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StorehouseMovement, StorehouseMovementSchema } from './schema/storehouse_movement.schema';
import { StorehouseMovementService } from './services/storehouse_movement.service';
import { StorehouseMovementController } from './controllers/storehouse_movement.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StorehouseMovement.name, schema: StorehouseMovementSchema }
    ])
  ],
  providers: [ StorehouseMovementService],
  controllers: [ StorehouseMovementController],
})
export class StorehouseMovementModule {}
