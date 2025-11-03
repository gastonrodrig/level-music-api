import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { WorkerType } from './worker-type.schema';
import { User } from 'src/modules/user/schema';
import { DocType, Estado } from 'src/core/constants/app.constants';

@Schema({ collection: 'workers' })
export class Worker {
  @Prop({ type: String })
  worker_type_name: string;

  @Prop({ type: String })
  first_name: string;

  @Prop({ type: String })
  last_name: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ enum: DocType, default: DocType.DNI, nullable: true })
  document_type: DocType;

  @Prop({ length: 255, nullable: true })
  document_number: string;

  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  status: Estado;

  @Prop({ type: Types.ObjectId, required: true, ref: WorkerType.name })
  worker_type: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: User.name })
  user: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({ type: Number, default: 1 }) 
  season_number: number;

  @Prop({ type: Number }) 
  reference_price: number;

  @Prop({ type: Date, default: Date.now }) 
  last_price_updated_at: Date;

  @Prop({ type: Boolean, default: false })
  has_account: boolean;
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);