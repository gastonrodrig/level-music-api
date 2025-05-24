
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StorehouseMovement, StorehouseMovementSchema } from './schema/storehouse-movement.schema';
import { StorehouseMovementService } from './services/storehouse-movement.service';
import { StorehouseMovementController } from './controllers/storehouse-movement.controller';

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
