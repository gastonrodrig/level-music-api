import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Worker } from 'src/modules/worker/schema'; // referencia al esquema Worker

@Schema({ collection: 'worker-prices' })
export class WorkerPrice {
  @Prop({ type: Types.ObjectId, ref: Worker.name, required: true })
  worker: Types.ObjectId;

  @Prop({ required: true })
  season_number: number;

  @Prop({ required: true })
  reference_price: number;

  @Prop({ required: true })
  start_date: Date;

  @Prop({ default: null })
  end_date: Date;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const WorkerPriceSchema = SchemaFactory.createForClass(WorkerPrice);
