import { Types, Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MaintenanceType, MaintenanceStatusType } from "../enum";
import { Resource } from "./resource.schema";

@Schema({ collection: 'maintenances' })
export class Maintenance extends Document {
  @Prop({ enum: MaintenanceType, default: MaintenanceType.CORRECTIVO })
  type: MaintenanceType;

  @Prop({ length: 255 })
  description: string;

  @Prop({ type: Types.ObjectId, ref: Resource.name, required: true })
  resource: Types.ObjectId;

  @Prop({ length: 255 })
  resource_name: string;

  @Prop({ enum: MaintenanceStatusType, default: MaintenanceStatusType.PROGRAMADO }) 
  status: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance);