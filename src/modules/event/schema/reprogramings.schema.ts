import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StatusType, PlaceType, StatusReprogramingsType } from '../enum';
import { User } from 'src/modules/user/schema';
import { EventType } from './event-type.schema';

@Schema({ collection: 'reprogramings' })
export class Reprogramings {
  
  @Prop({ required: true })
  previousDate: Date;

  @Prop({ unique: true, sparse: true, trim: true })
  previousTimeRange: string;

  @Prop({ required: true })
  newDate: Date;

  @Prop({ length: 255 })
  newTimeRange: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, enum: StatusReprogramingsType })
  status: StatusReprogramingsType;

  @Prop({ type: Types.ObjectId, required: true, ref: EventType.name })
  event_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  user_id: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const ReprogramingsSchema = SchemaFactory.createForClass(Reprogramings);