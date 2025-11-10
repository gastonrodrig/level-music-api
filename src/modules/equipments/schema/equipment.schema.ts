import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LocationType, EquipmentStatusType, EquipmentType } from "../enum";

@Schema({ collection: 'equipments' })
export class Equipment extends Document {
  @Prop({ length: 255 }) 
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ enum: EquipmentType, default: EquipmentType.SONIDO })
  equipment_type: EquipmentType;

  @Prop({ required: true }) 
  serial_number: string;

  @Prop({ enum: EquipmentStatusType, default: EquipmentStatusType.DISPONIBLE, required: false }) 
  status?: EquipmentStatusType;

  @Prop({ enum: LocationType, default: LocationType.ALMACEN, required: false }) 
  location?: LocationType;

  @Prop({ default: null })
  last_maintenance_date: Date;

  @Prop()
  next_maintenance_date: Date;

  @Prop() 
  maintenance_interval_days: number;

  @Prop({ default: 1 })
  maintenance_count: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({ type: Number, default: 1 }) 
  season_number: number;

  @Prop({ type: Number }) 
  reference_price: number;

  @Prop({ type: Date, default: Date.now }) 
  last_price_updated_at: Date;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);

