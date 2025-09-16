import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StatusType, PlaceType } from '../enum';
import { User } from 'src/modules/user/schema';
import { EventType } from './event-type.schema';
import { ServiceRequested, ServiceRequestedSchema } from './service-requested.schema';
import { ClientType } from 'src/modules/user/enum';

@Schema({ collection: 'events' })
export class Event {
  @Prop({ unique: true, sparse: true, trim: true })
  event_code: string;

  @Prop({ maxlength: 255 })
  name: string;

  @Prop({ maxlength: 255 })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  start_time: string;

  @Prop({ required: true })
  end_time: string;

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
  user_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: EventType.name, required: false, default: null })
  event_type_id?: Types.ObjectId | null;

  @Prop({ type: String, required: false, nullable: true })
  event_type_name?: string;

  @Prop({ type: [ServiceRequestedSchema], default: [] })
  services_requested: ServiceRequested[];

  @Prop({ type: Number, default: 0 })
  estimated_price?: number;

  @Prop({ type: Number, nullable: true })
  final_price?: number;

  @Prop({
    _id: false,
    type: {
      client_type: { type: String, enum: ClientType },
      first_name: String,
      last_name: String,
      company_name: String,
      contact_person: String,
      email: String,
      phone: String,
      document_type: String,
      document_number: String,
    },
    required: true,
  })
  client_info: {
    client_type: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    document_type?: string;
    document_number?: string;
  };

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
