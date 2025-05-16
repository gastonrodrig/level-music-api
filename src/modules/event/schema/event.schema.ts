import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StatusType } from '../enum/status-type';
import { PlaceType } from '../enum/place-type';

@Schema({ collection: 'Event' })
export class Event{
  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  timeRange: string;

  @Prop({ required: true })
  attendeesCount: number;

  @Prop({ required: true })
  exactAddress: string;

  @Prop({ required: true })
  locationReference?: string;

  @Prop({ required: true, enum: PlaceType })
  placeType: PlaceType;

  @Prop({ required: true })
  placeSize: number;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'EventType' })
  eventTypeId: Types.ObjectId;

  @Prop({ required: true, enum: StatusType })
  state: StatusType;

  @Prop({ type: Number, nullable: true })
  finalPrice?: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);