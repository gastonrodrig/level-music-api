import { Module } from "@nestjs/common";
import { MongooseModule, getConnectionToken } from "@nestjs/mongoose";
import { ScheduleModule } from '@nestjs/schedule';
import { 
  Resource,
  ResourceSchema,
  Maintenance,
  MaintenanceSchema,
} from "./schema";
import {
  ResourceService,
  MaintenanceService,
  PreventiveMaintenanceSchedulerService,
} from "./services";
import {
  ResourceController,
  MaintenanceController,
} from "./controllers";
import { addResourceHooks } from "./hooks";
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
        name: Resource.name,
        useFactory: (connection: Connection) => {
          const schema = ResourceSchema;
          addResourceHooks(schema, connection);
          return schema;
        },
        inject: [getConnectionToken()],
      }
    ]),

    ScheduleModule.forRoot(), 
  ],
  providers: [
    ResourceService, 
    MaintenanceService, 
    PreventiveMaintenanceSchedulerService 
  ],
  controllers: [
    ResourceController, 
    MaintenanceController
  ]
})
export class ResourceModule {}
