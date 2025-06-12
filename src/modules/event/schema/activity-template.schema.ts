import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { PhaseType } from "../enum/phase-type.enum";
import { EventType } from "./event-type.schema";
import { WorkerType } from "src/modules/worker/schema/worker-type.schema";

@Schema({ collection: 'activity-templates' })
export class ActivityTemplate {
  @Prop({ type: Types.ObjectId, required: true, ref: EventType.name })
  event_type_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: WorkerType.name })
  worker_type_id: Types.ObjectId;

  @Prop({ length: 255 })
  title: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ enum: PhaseType, default: PhaseType.PRE_EVENTO }) 
  phase: string;

  @Prop({ default: true })
  requires_evidence: boolean;

  @Prop({ default: Date.now })
  created_at: Date;
  
  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ActivityTemplateSchema = SchemaFactory.createForClass(ActivityTemplate);

ActivityTemplateSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

ActivityTemplateSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});