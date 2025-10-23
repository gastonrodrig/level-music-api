import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Multimedia, MultimediaSchema } from '../../uploads';
import { PhaseType, TaskStatusType } from "../enum";
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
  status: string;
  
  @Prop({ length: 255 })
  notes: string;
  
  @Prop({ length: 255 })
  title: string;
  
  @Prop({ type: Boolean, default: false })
  requires_evidence: boolean;

  //todo lo de arriba si va 


  // @Prop({ type: MultimediaSchema, required: false, default: null })
  // evidence?: Multimedia;

  @Prop({ default: Date.now })
  assigned_at: Date;

  @Prop({ type: Date})
  completed_at: Date ;
}

export const EventTaskSchema = SchemaFactory.createForClass(EventTask);