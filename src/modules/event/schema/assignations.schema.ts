import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { DayOfWeek, ResourceType } from "../enum";
import { Estado } from "src/core/constants/app.constants";

@Schema({ collection: 'assignations' })
export class Assignation {
  // Datos comunes
  @Prop({ type: Number, default: 0 })
  hours: number;

  @Prop({ type: Number, default: 0 })
  hourly_rate: number;

  // Horarios de asignación
  @Prop({ maxlength: 255 })
  available_from: string; // Ej: "14:00"

  @Prop({ maxlength: 255 })
  available_to: string;   // Ej: "20:00"

  @Prop({ enum: DayOfWeek })
  day_of_week?: DayOfWeek; 

  // --- Solo si es servicio ---
  @Prop({ type: Object })
  service_detail: Object;

  @Prop({ type: Number })
  service_ref_price?: number;

  @Prop()
  service_provider_name?: string;

  @Prop()
  service_type_name?: string;

  // --- Solo si es equipo ---
  @Prop()
  equipment_name?: string;

  @Prop()
  equipment_description?: string;

  @Prop()
  equipment_type?: string;

  @Prop()
  equipment_serial_number?: string;

  @Prop()
  equipment_status?: string;

  // --- Solo si es trabajador ---
  @Prop()
  worker_role?: string;

  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  worker_status?: Estado;

  // Referencias
  @Prop({ enum: ResourceType, required: true })
  resource_type: ResourceType;

  @Prop({ type: Types.ObjectId, required: true })
  resource_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: Event.name })
  event: Types.ObjectId;

  @Prop({ default: Date.now })
  assigned_at: Date;
}

export const AssignationSchema = SchemaFactory.createForClass(Assignation);