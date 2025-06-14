import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { WorkerType } from './worker-type.schema';
import { User } from 'src/modules/user/schema';

@Schema({ collection: 'workers' })
export class Worker {
  @Prop({ type: Types.ObjectId, required: true, ref: WorkerType.name })
  worker_type: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: User.name })
  user: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({ type: String })
  worker_type_name: string;

  @Prop({ type: String })
  first_name: string;

  @Prop({ type: String })
  last_name: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String }) 
  role: string;
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);