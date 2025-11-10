import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Service } from "./service.schema";
import { Estado } from "src/core/constants/app.constants";

@Schema({ collection: 'service-details' })
export class ServiceDetail {
  @Prop({ type: Types.ObjectId, required: true, ref: Service.name })
  service_id: Types.ObjectId;

  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  status: string;

  @Prop({ type: Object })  
  details: Object;

  @Prop({ type: Number })
  ref_price: number;

  @Prop({ type: Number, default: 1 }) 
  season_number: number;

  @Prop({ type: Date, default: Date.now }) 
  last_price_updated_at: Date;

  @Prop({ type: [Types.ObjectId], ref: 'ServiceMedia', default: [] })
  photos: Types.ObjectId[];
}

export const ServiceDetailSchema = SchemaFactory.createForClass(ServiceDetail);