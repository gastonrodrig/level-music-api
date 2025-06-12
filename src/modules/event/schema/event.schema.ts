import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StatusType } from '../enum/status-type.enum';
import { PlaceType } from '../enum/place-type.enum';
import { User } from 'src/modules/user/schema/user.schema';
import { EventType } from './event-type.schema';

@Schema({ collection: 'events' })
export class Event {
  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time_range: string;

  @Prop({ required: true })
  attendees_count: number;

  @Prop({ required: true })
  exact_address: string;

  @Prop({ required: true })
  location_reference?: string;

  @Prop({ required: true, enum: PlaceType })
  place_type: PlaceType;

  @Prop({ required: true })
  place_size: number;

  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: EventType.name })
  event_type_id: Types.ObjectId;

  @Prop({ required: true, enum: StatusType })
  state: StatusType;

  @Prop({ type: Number, nullable: true })
  final_price?: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

EventSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});
