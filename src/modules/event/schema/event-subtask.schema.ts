import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Worker, WorkerType } from 'src/modules/worker/schema';
import { StoreMovementType } from 'src/modules/storehouse/enum';
import { TaskPhase, TaskStatusType } from '../enum';

@Schema({ collection: 'event-subtasks' })
export class EventSubtask extends Document {
  @Prop({ type: Types.ObjectId, ref: 'EventTask', required: true })
  parent_task: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Boolean, default: false })
  is_for_storehouse: boolean; 

  @Prop({ type: Number, required: false })
  price?: number;
  
  @Prop({ type: Types.ObjectId, ref: Worker.name, required: false })
  worker?: Types.ObjectId; 

  @Prop({ type: String, required: false })
  worker_name?: string;

  @Prop({ type: Types.ObjectId, ref: WorkerType.name, required: false })
  worker_type?: Types.ObjectId; 

  @Prop({ type: String, required: false })
  worker_type_name?: string;

  @Prop({ type: String, required: false })
  storehouse_code?: string;

  @Prop({ enum: StoreMovementType})
  store_movement_type?: StoreMovementType;

  @Prop({ enum: TaskPhase, default: TaskPhase.PLANIFICACION })
  phase?: TaskPhase;

  @Prop({ type: String, enum: Object.values(TaskStatusType), default: TaskStatusType.PENDIENTE })
  status: TaskStatusType;

  @Prop({ type: Boolean, default: true })
  requires_evidence: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'EventSubtaskEvidence', default: [] })
  evidences: Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  assigned_at?: Date;

  @Prop({ type: Date, default: null })
  completed_at?: Date;

  @Prop({ type: String, required: false })
  notas?: string;
}

export const EventSubtaskSchema = SchemaFactory.createForClass(EventSubtask);
