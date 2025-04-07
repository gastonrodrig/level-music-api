import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'Worker' })
export class Worker {
  @Prop({ type: Types.ObjectId, ref: 'Worker_type', required: true })
  worker_type_id: Types.ObjectId;

  @Prop({ default: true })
  availability: boolean;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);
