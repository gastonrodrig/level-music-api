import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Equipment, EquipmentSchema } from "./schema/equipment.schema";
import { EquipmentService } from "./services/equipment.service";
import { EquipmentController } from "./controllers/equipment.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
          { name: Equipment.name, schema: EquipmentSchema }
        ])
      ],
      providers : [EquipmentService],
      controllers: [EquipmentController]

})
export class EquipmentModule {}