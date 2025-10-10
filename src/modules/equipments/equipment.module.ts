import { Module } from "@nestjs/common";
import { MongooseModule, getConnectionToken } from "@nestjs/mongoose";
import { ScheduleModule } from '@nestjs/schedule';
import { 
  Equipment,
  EquipmentAvailability,
  EquipmentAvailabilitySchema,
  EquipmentSchema,
  Maintenance,
  MaintenanceSchema,
} from "./schema";
import {
  EquipmentService,
  MaintenanceService,
  PreventiveMaintenanceSchedulerService,
  MaintenanceNotificationSchedulerService,
} from "./services";
import {
  EquipmentController,
  MaintenanceController,
} from "./controllers";
import { addEquipmentHooks } from "./hooks";
import { Connection } from "mongoose";
import { WhatsAppModule } from '../whatsapp/whatsapp.module';


@Module({
  imports: [
    // Registramos Maintenance normalmente (no requiere hooks)
    MongooseModule.forFeature([
      { name: Maintenance.name, schema: MaintenanceSchema },
      { name: EquipmentAvailability.name, schema: EquipmentAvailabilitySchema }
    ]),

    // Registramos Equipment con hooks (requiere connection)
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
    WhatsAppModule,
  ],
  providers: [
    EquipmentService,
    MaintenanceService, 
    PreventiveMaintenanceSchedulerService,
    MaintenanceNotificationSchedulerService
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
