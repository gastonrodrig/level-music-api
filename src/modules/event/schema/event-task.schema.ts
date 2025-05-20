import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Multimedia, MultimediaSchema } from '../../uploads';
import { PhaseType, TaskStatusType } from "../enum";

@Schema({ collection: 'event-tasks' })
export class EventTask {
  @Prop({ type: Types.ObjectId, required: true, ref: 'events' })
  event_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: 'activity-templates', default: null })
  template_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'worker-types' })
  worker_type_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: 'workers', default: null })
  worker_id?: Types.ObjectId;

  @Prop({ length: 255 })
  title: string;

  @Prop({ length: 255 })
  notes: string;

  @Prop({ enum: PhaseType, default: PhaseType.PRE_EVENTO }) 
  phase: string;

  @Prop({ enum: TaskStatusType, default: TaskStatusType.PENDIENTE }) 
  status: string;

  @Prop({ default: true })
  requires_evidence: boolean;

  @Prop({ type: MultimediaSchema, required: false, default: null })
  evidence?: Multimedia;

  @Prop({ default: Date.now })
  assigned_at: Date;

  @Prop({ default: null })
  completed_at: Date | null;
}

export const EventTaskSchema = SchemaFactory.createForClass(EventTask);