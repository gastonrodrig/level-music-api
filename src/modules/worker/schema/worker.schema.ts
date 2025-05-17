import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'workers' })
export class Worker {
  @Prop({ type: Types.ObjectId, required: true, ref: 'worker-types' })
  worker_type_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'users' })
  user_id: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);

WorkerSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

WorkerSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});
