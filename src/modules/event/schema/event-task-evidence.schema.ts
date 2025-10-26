import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Multimedia, MultimediaSchema } from '../../uploads';
import { Document } from "mongoose";


@Schema({ collection: 'task-evidences', timestamps: false })
export class TaskEvidence extends Document {
  @Prop({ type: Types.ObjectId, ref: 'EventTask', required: true })
  event_task_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  worker_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  file_url: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: null })
  updated_at: Date;
}
export const TaskEvidenceSchema = SchemaFactory.createForClass(TaskEvidence); 
