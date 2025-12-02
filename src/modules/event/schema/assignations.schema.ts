import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ResourceType } from "../enum";
import {LocationType} from "src/modules/equipments/enum";
import { Worker, WorkerType } from "src/modules/worker/schema";

@Schema({ collection: 'assignations' })
export class Assignation {
  // Datos comunes
  @Prop({ type: Number, default: 1 })
  hours?: number;

  @Prop({ type: Number, default: 0 })
  hourly_rate: number;

  // Horarios de asignación
  @Prop({ type: Date, required: true })
  available_from: Date; 

  @Prop({ type: Date, required: true })
  available_to: Date; 

  // --- Solo si es servicio ---
  @Prop({ type: Object })
  service_detail: Object;

  @Prop({ type: Number })
  service_ref_price?: number;

  @Prop({ type: String })
  service_provider_email?: string;

  @Prop({ type: String })
  service_provider_name?: string;

  @Prop({ type: String })
  service_type_name?: string;

  @Prop()
  service_status?: string;

  // --- Solo si es equipo ---
  @Prop({ type: String })
  equipment_name?: string;

  @Prop({ type: String })
  equipment_description?: string;

  @Prop({ type: String })
  equipment_type?: string;

  @Prop({ type: String })
  equipment_serial_number?: string;

  @Prop({ enum: LocationType  })
  equipment_location?: LocationType;

  @Prop({ type: String })
  equipment_status?: string;

  // --- Solo si es trabajador ---
  @Prop({ type: String })
  worker_type_name?: string;

  @Prop({ type: Number, default: 1, required: false })
  quantity_required?: number;

  @Prop({ type: [Types.ObjectId], ref: Worker.name, default: [] })
  assigned_workers?: Types.ObjectId[];

  // --- Política de pago del servicio ---
  @Prop({ type: Number, min: 0, max: 100, default: 100 })
  payment_percentage_required: number;

  // Referencias
  @Prop({ enum: ResourceType, required: true })
  resource_type: ResourceType; 

  @Prop({ type: Types.ObjectId, required: true })
  resource: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: Event.name })
  event: Types.ObjectId;

  @Prop({ default: Date.now })
  assigned_at: Date;
}

export const AssignationSchema = SchemaFactory.createForClass(Assignation);