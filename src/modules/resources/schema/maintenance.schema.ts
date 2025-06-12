import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MaintenanceType } from "../enum";
import { Types } from "mongoose";
import { MaintenanceStatusType } from "../enum";
import { Resource } from "./resource.schema";

@Schema({ collection: 'maintenances' })
export class Maintenance {
  @Prop({ enum: MaintenanceType, default: MaintenanceType.CORRECTIVO })
  type: MaintenanceType;

  @Prop({ length: 255 })
  description: string;

  @Prop({ type: Types.ObjectId, ref: Resource.name, required: true })
  resource: Types.ObjectId;

  @Prop({ enum: MaintenanceStatusType, default: MaintenanceStatusType.PROGRAMADO }) 
  status: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance);