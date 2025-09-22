import { Types, Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MaintenanceType, MaintenanceStatusType } from "../enum";
import { Equipment } from "./equipment.schema";

@Schema({ collection: 'maintenances' })
export class Maintenance extends Document {
  @Prop({ enum: MaintenanceType, default: MaintenanceType.CORRECTIVO })
  type: MaintenanceType;

  @Prop({ length: 255 })
  description: string;

  @Prop({ type: Types.ObjectId, ref: Equipment.name, required: true })
  equipment: Types.ObjectId;

  @Prop({ length: 255 })
  equipment_serial_number: string;

  @Prop({ length: 255 })
  equipment_name: string;

  @Prop({ length: 255 })
  equipment_type: string;

  @Prop({ enum: MaintenanceStatusType, default: MaintenanceStatusType.PROGRAMADO }) 
  status: string;

  @Prop({ length: 255 , default: null })
  reagendation_reason?: string;

  @Prop({ length: 255 , default: null })
  cancelation_reason?: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance);