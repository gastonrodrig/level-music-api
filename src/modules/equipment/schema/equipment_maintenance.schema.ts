import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MaintenanceType } from "../enum/maintenanceType";
import { Types } from "mongoose";

@Schema({ collection: 'EquipmentMaintenance' })
export class EquipmentMaintenance {
  @Prop({ type: Types.ObjectId, ref: 'Equipment' })
  equipment_id: string;

  @Prop({ enum: MaintenanceType, nullable: true })
  maintenance_type: MaintenanceType;

  @Prop({ length: 255, nullable: true })
  description: string;
  
  @Prop({ default: Date.now })
  date: Date;
}

export const EquipmentMaintenanceSchema = SchemaFactory.createForClass(EquipmentMaintenance);