import { Module } from "@nestjs/common";
import { MongooseModule, getConnectionToken } from "@nestjs/mongoose";
import { ScheduleModule } from '@nestjs/schedule';
import { 
  Equipment,
  EquipmentSchema,
  Maintenance,
  MaintenanceSchema,
} from "./schema";
import {
  EquipmentService,
  MaintenanceService,
  PreventiveMaintenanceSchedulerService,
} from "./services";
import {
  EquipmentController,
  MaintenanceController,
} from "./controllers";
import { addEquipmentHooks } from "./hooks";
import { Connection } from "mongoose";

@Module({
  imports: [
    // Registramos Maintenance normalmente (no requiere hooks)
    MongooseModule.forFeature([
      { name: Maintenance.name, schema: MaintenanceSchema },
    ]),

    // Registramos Resource con hooks (requiere connection)
    MongooseModule.forFeatureAsync([
      {
        name: Equipment.name,
        useFactory: (connection: Connection) => {
          const schema = EquipmentSchema;
          addEquipmentHooks(schema, connection);
          return schema;
        },
        inject: [getConnectionToken()],
      }
    ]),

    ScheduleModule.forRoot(), 
  ],
  providers: [
    EquipmentService,
    MaintenanceService, 
    PreventiveMaintenanceSchedulerService 
  ],
  controllers: [
    EquipmentController,
    MaintenanceController
  ],
  exports: [
    MongooseModule
  ],
})
export class EquipmentModule {}
