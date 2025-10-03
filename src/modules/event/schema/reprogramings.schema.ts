import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Types } from 'mongoose';
import { StatusReprogramingsType } from '../enum';
import { User } from 'src/modules/user/schema';
import { EventType } from './event-type.schema';

@Schema({ collection: 'reprogramings' })
export class Reprogramings {
  @Prop({ type: Date, required: true })
  previous_date: Date;

  @Prop({ type: Date, required: true })
  previous_start_time: Date;

  @Prop({ type: Date, required: true })
  previous_end_time: Date;

  @Prop({ type: Date, required: true })
  new_date: Date;

  @Prop({ type: Date, required: true })
  new_start_time: Date;

  @Prop({ type: Date, required: true })
  new_end_time: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, enum: StatusReprogramingsType })
  status: StatusReprogramingsType;

  @Prop({ type: Types.ObjectId, required: true, ref: EventType.name })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  user: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;
}

export const ReprogramingsSchema = SchemaFactory.createForClass(Reprogramings);