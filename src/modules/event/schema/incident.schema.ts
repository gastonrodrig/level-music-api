import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Equipment } from 'src/modules/equipments/schema';
import { Worker } from 'src/modules/worker/schema';
import { EquipmentType } from '../enum';
import { IncidentType } from '../enum';

@Schema({ collection: 'incidents' })
export class Incident {
  @Prop({ required: true, enum: EquipmentType })
  equipment_type: EquipmentType;

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

  @Prop({ type: Types.ObjectId, required: true, ref: Equipment.name })
  equipment: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);