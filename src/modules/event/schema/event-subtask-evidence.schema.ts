import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ collection: 'subtask-evidences' })
export class EventSubtaskEvidence extends Document {
  @Prop({ type: Types.ObjectId, ref: 'EventSubtask', required: true })
  event_subtask_id: Types.ObjectId; 

  @Prop({ type: Types.ObjectId, required: true })
  worker_id: Types.ObjectId; 

  @Prop({ type: String, required: true })
  file_url: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: null })
  updated_at: Date;
}

export const EventSubtaskEvidenceSchema = SchemaFactory.createForClass(EventSubtaskEvidence);
