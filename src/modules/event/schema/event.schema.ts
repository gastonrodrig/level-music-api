import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StatusType, PlaceType } from '../enum';
import { User } from 'src/modules/user/schema';
import { EventType } from './event-type.schema';
import { ClientType } from 'src/modules/user/enum';

@Schema({ collection: 'events' })
export class Event {
  @Prop({ type: Number, default: 1 })
  version: number;

  @Prop({ type: Boolean, default: true })
  is_latest: boolean;

  @Prop({ trim: true, index: true }) 
  event_code: string;

  @Prop({ maxlength: 255 })
  name: string;

  @Prop({ maxlength: 255 })
  description: string;

  @Prop({ required: true })
  event_date: Date;

  @Prop({ required: true })
  start_time: Date;

  @Prop({ required: true })
  end_time: Date;

  @Prop({ required: true })
  attendees_count: number;

  @Prop({ required: true })
  exact_address: string;

  @Prop({ required: true })
  location_reference: string;

  @Prop({ required: true, enum: PlaceType })
  place_type: PlaceType;

  @Prop({ required: true })
  place_size: number;

  @Prop({ type: Types.ObjectId, ref: User.name, required: false, default: null })
  user?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: EventType.name, required: false, default: null })
  event_type?: Types.ObjectId | null;

  @Prop({ type: String, required: false, nullable: true })
  event_type_name?: string;

  @Prop({ type: Number, default: 0 })
  estimated_price: number;

  @Prop({ type: Number, nullable: true })
  final_price?: number;

  @Prop({ enum: StatusType, default: StatusType.CREADO })
  status: StatusType;

  // Reemplazado client_info por campos desnormalizados
  @Prop({ required: true, enum: ClientType })
  client_type: ClientType;

  @Prop({ maxlength: 255, required: false })
  first_name?: string;

  @Prop({ maxlength: 255, required: false })
  last_name?: string;

  @Prop({ maxlength: 255, required: false })
  company_name?: string;

  @Prop({ maxlength: 255, required: false })
  contact_person?: string;

  @Prop({ maxlength: 255, required: false })
  email?: string;

  @Prop({ maxlength: 50, required: false })
  phone?: string;

  @Prop({ maxlength: 50, required: false })
  document_type?: string;

  @Prop({ maxlength: 50, required: false })
  document_number?: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
