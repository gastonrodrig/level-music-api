import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ResourceType } from "../enum";
import { Estado } from "src/core/constants/app.constants";

@Schema({ collection: 'assignations' })
export class Assignation {
  // Datos comunes
  @Prop({ type: Number, default: 0 })
  hours: number;

  @Prop({ type: Number, default: 0 })
  hourly_rate: number;

  // Horarios de asignación
  @Prop({ type: Date, required: true })
  available_from: Date; // Ej: 2025-09-22T22:00:00Z

  @Prop({ type: Date, required: true })
  available_to: Date; 

  // --- Solo si es servicio ---
  @Prop({ type: Object })
  service_detail: Object;

  @Prop({ type: Number })
  service_ref_price?: number;

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

  @Prop({ type: Number })
  equipment_location?: number;

  @Prop({ type: String })
  equipment_status?: string;

  // --- Solo si es trabajador ---
  @Prop({ type: String })
  worker_first_name?: string;

  @Prop({ type: String })
  worker_last_name?: string;

  @Prop({ type: String })
  worker_role?: string;

  @Prop({ enum: Estado }) 
  worker_status?: Estado;

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