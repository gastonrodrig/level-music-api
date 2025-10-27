import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Multimedia, MultimediaSchema } from '../../uploads';
import { PhaseType, TaskStatusType, TaskPhase } from "../enum";
import { Event } from "./event.schema";
import { EventType } from "./event-type.schema";
import { WorkerType, Worker } from "src/modules/worker/schema";

@Schema({ collection: 'event-tasks' })
export class EventTask {
  @Prop({ type: Types.ObjectId, required: false, ref: Event.name })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: Worker.name, default: null })
  worker?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: WorkerType.name })
  worker_type: Types.ObjectId;

  @Prop({ type: String, required: false })
  worker_type_name?: string;

  @Prop({ type: String, required: false })
  worker_name?: string;

  @Prop({ type: Types.ObjectId, ref: EventType.name, required: true })
  event_type?: Types.ObjectId;

  @Prop({ enum: TaskStatusType, default: TaskStatusType.PENDIENTE }) 
  status: TaskStatusType;
  
  @Prop({ length: 255 })
  notes: string;
  
  @Prop({ length: 255 })
  title: string;
  
  @Prop({ type: Boolean, default: true })
  requires_evidence: boolean;

  @Prop({ type: String, enum: TaskPhase, default: TaskPhase.PLANIFICACION })
  phase?: TaskPhase;

  
  @Prop({ type: Date, default: Date.now })
  assigned_at?: Date;
  
  @Prop({ type: Date, default: null  })
  completed_at?: Date;
  
  // array de evidencias (si usas MultimediaSchema para evidences)
  @Prop({ type: [Types.ObjectId], ref: 'TaskEvidence', default: [] })
  evidences: Types.ObjectId[];
}

export const EventTaskSchema = SchemaFactory.createForClass(EventTask);