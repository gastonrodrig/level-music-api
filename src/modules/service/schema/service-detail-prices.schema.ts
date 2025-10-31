import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'service-detail-prices' })
export class ServiceDetailPrice extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ServiceDetail', required: true })
  service_detail_id: Types.ObjectId;

  @Prop({ type: Number, required: true })
  reference_detail_price: number;

  @Prop({ type: Date, required: true })
  start_date: Date;

  @Prop({ type: Date, required: true })
  end_date: Date;
}

export const ServiceDetailPriceSchema =
  SchemaFactory.createForClass(ServiceDetailPrice);
