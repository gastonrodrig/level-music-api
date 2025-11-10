import { Prop,Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ collection: 'service-media' })
export class ServiceMedia { 
  @Prop({ length: 255 })
  url: string;

  @Prop({ length: 255 })
  name: string;

  @Prop()
  size: number;

  @Prop({ length: 255 })
  storage_path: string;

  @Prop({ default: Date.now })
  created_at: Date;
  
  @Prop({ type: Types.ObjectId, ref: 'ServiceDetail', required: true })
  service_detail?: Types.ObjectId;
}

export const ServiceMediaSchema = SchemaFactory.createForClass(ServiceMedia);