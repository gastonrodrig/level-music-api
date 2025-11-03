import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ClientType } from "src/modules/user/enum";
import { DocType } from "src/core/constants/app.constants";
import { AppointmentShift, AppointmentStatus, MeetingType } from "../enum";
import { User } from 'src/modules/user/schema'; // reemplazado: antes venía de "mercadopago"
import { Types } from "mongoose";

@Schema({ collection: 'appointments' })
export class Appointment {
  @Prop({ required: true, enum: ClientType, default: ClientType.PERSONA })
  client_type: ClientType;

  @Prop({ maxlength: 255 })
  first_name?: string;

  @Prop({ maxlength: 255 })
  last_name?: string;

  @Prop({ maxlength: 255 })
  company_name?: string;

  @Prop({ maxlength: 255 })
  contact_person?: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  document_type: DocType;

  @Prop({ required: true })
  document_number: string;

  @Prop({ required: true, enum: MeetingType, default: MeetingType.VIRTUAL })
  meeting_type: MeetingType;

  @Prop({ required: true })
  start_date: Date;

  @Prop({ required: true })
  end_date: Date;

  @Prop({ enum: AppointmentShift, required: true })
  shift: AppointmentShift;

  @Prop({ required: true })
  attendees_count: number;

  @Prop({ enum: AppointmentStatus, default: AppointmentStatus.PENDIENTE })
  status: AppointmentStatus;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
