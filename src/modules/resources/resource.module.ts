import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Resource, ResourceSchema } from "./schema/resource.schema";
import { ResourceService } from "./services/resource.service";
import { ResourceController } from "./controllers/resource.controller";
import { Maintenance, MaintenanceSchema } from "./schema/maintenance.schema";
import { MaintenanceService } from "./services/maintenance.service";
import { MaintenanceController } from "./controllers/maintenance.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
      { name: Maintenance.name, schema: MaintenanceSchema },
    ])
  ],
  providers : [ResourceService, MaintenanceService],
  controllers: [ResourceController, MaintenanceController]
})
export class ResourceModule {}
