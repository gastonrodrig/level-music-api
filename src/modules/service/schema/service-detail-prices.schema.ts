import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'service-detail-prices' })
export class ServiceDetailPrice extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ServiceDetail', required: true })
  service_detail_id: Types.ObjectId;

  @Prop({ type: Number, required: true })
  reference_price: number;

  @Prop({ type: Date, required: true })
  start_date: Date;

  @Prop({ type: Date, default: null })
  end_date?: Date | null;

  @Prop({ type: Number, default: 1 })
  season_number: number;
}

export const ServiceDetailPriceSchema =
  SchemaFactory.createForClass(ServiceDetailPrice);
