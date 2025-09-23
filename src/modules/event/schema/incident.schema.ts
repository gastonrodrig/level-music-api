import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Resource } from 'src/modules/resources/schema';
import { Worker } from 'src/modules/worker/schema';
import { ResourceType } from '../enum';
import { IncidentType } from '../enum';

@Schema({ collection: 'incidents' })
export class Incident {
  @Prop({ required: true, enum: ResourceType })
  resource_type: ResourceType;

  @Prop({ required: true, enum: IncidentType })
  incident_type: IncidentType;

  @Prop({ length: 255 })
  description: string;

  @Prop({ length: 255 })
  incident_date: string;

  @Prop({ length: 255 })
  incident_location: string;

  @Prop({ type: Types.ObjectId, required: true, ref: Event.name })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: Worker.name })
  worker: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: Resource.name })
  resource: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);