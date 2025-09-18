import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StatusType, PlaceType } from '../enum';
import { User } from 'src/modules/user/schema';
import { EventType } from './event-type.schema';
import { Resource } from 'src/modules/resources/schema';

@Schema({ collection: 'events' })
export class Incident {
  @Prop({ unique: true, sparse: true, trim: true })
  description: string;

  @Prop({ length: 255 })
  incident_date: string;

  @Prop({ length: 255 })
  incident_location: string;

  @Prop({ type: Types.ObjectId, required: true, ref: Event.name })
  event_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: Worker.name })
  worker: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: Resource.name })
  resource: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;

}

export const IncidentSchema = SchemaFactory.createForClass(Incident);