import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StatusType, PlaceType } from '../enum';
import { User } from 'src/modules/user/schema';
import { EventType } from './event-type.schema';
import { ClientType } from 'src/modules/user/enum';
import { QuotationCreator } from '../enum';

@Schema({ collection: 'events' })
export class Event {
  @Prop({ unique: true, sparse: true, trim: true })
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
  estimated_price?: number;

  @Prop({ type: Number, nullable: true })
  final_price?: number;

  @Prop({ enum: StatusType, default: StatusType.PENDIENTE_CONFIGURACION })
  status: StatusType;

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

  @Prop({ enum: QuotationCreator })
  creator: QuotationCreator;

  @Prop({type:Boolean})
  is_quotation: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);
