import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StatusReprogramingsType } from '../enum';
import { User } from 'src/modules/user/schema';
import { EventType } from './event-type.schema';

@Schema({ collection: 'reprogramings' })
export class Reprogramings {
  @Prop({ required: true })
  previous_date: Date;

  @Prop({ unique: true, sparse: true, trim: true })
  previous_time_range: string;

  @Prop({ required: true })
  new_date: Date;

  @Prop({ type: Date, required: true })
  old_available_from: Date;

  @Prop({ type: Date, required: true })
  old_available_to: Date;

  @Prop({ length: 255 })
  new_available_from: string;

  @Prop({ length: 255 })
  new_available_to: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, enum: StatusReprogramingsType })
  status: StatusReprogramingsType;

  @Prop({ type: Types.ObjectId, required: true, ref: EventType.name })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  user: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const ReprogramingsSchema = SchemaFactory.createForClass(Reprogramings);