import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { PhaseType } from "../enum/phase-type";

@Schema({ collection: 'event-tasks' })
export class EventTask {
  @Prop({ type: Types.ObjectId, required: true, ref: 'events' })
  event_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: 'activity-templates', default: null })
  template_id: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, required: true, ref: 'worker-types' })
  worker_type_id: Types.ObjectId;

  @Prop({ length: 255 })
  title: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ enum: PhaseType, default: PhaseType.PRE_EVENTO }) 
  phase: string;

  @Prop({ default: Date.now })
  created_at: Date;
  
  @Prop({ default: Date.now })
  updated_at: Date;
}

export const EventTaskSchema = SchemaFactory.createForClass(EventTask);

EventTaskSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

EventTaskSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});