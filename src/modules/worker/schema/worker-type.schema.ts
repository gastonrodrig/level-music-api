import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Estado } from 'src/core/constants/app.constants';

@Schema({ collection: 'worker-types' })
export class WorkerType {
  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  status: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const WorkerTypeSchema = SchemaFactory.createForClass(WorkerType);

WorkerTypeSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

WorkerTypeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});
