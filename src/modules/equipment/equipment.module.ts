import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Equipment, EquipmentSchema } from "./schema/equipment.schema";
import { EquipmentService } from "./services/equipment.service";
import { EquipmentController } from "./controllers/equipment.controller";
import { EquipmentMaintenance, EquipmentMaintenanceSchema } from "./schema/equipment_maintenance.schema";
import { EquipmentMaintenanceService } from "./services/equipment_maintenance.service";
import { EquipmentMaintenanceController } from "./controllers/equipment_maintenance.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
          { name: Equipment.name, schema: EquipmentSchema },
          { name: EquipmentMaintenance.name, schema: EquipmentMaintenanceSchema },
        ])
      ],
      providers : [EquipmentService, EquipmentMaintenanceService],
      controllers: [EquipmentController, EquipmentMaintenanceController]

})
export class EquipmentModule {}