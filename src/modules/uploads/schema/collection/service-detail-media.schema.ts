import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ServiceDetail } from 'src/modules/service/schema/service-detail.schema';

@Schema({ collection: 'service-detail-media' })
export class ServiceDetailMedia {
  _id: any

  @Prop({ length: 255 })
  url: string;

  @Prop({ length: 255 })
  name: string;

  @Prop()
  size: number;

  @Prop({ length: 255 })
  storagePath: string;

  @Prop({ type: Types.ObjectId, ref: ServiceDetail.name, required: true })
  detail_id: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const ServiceDetailMediaSchema = SchemaFactory.createForClass(ServiceDetailMedia);
