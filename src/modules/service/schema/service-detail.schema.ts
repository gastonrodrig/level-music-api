import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ServiceDetailMedia, ServiceDetailMediaSchema } from "src/modules/uploads";
import { Service } from "./service.schema";

@Schema({ collection: 'service-details' })
export class ServiceDetail {
  @Prop({ type: Types.ObjectId, required: true, ref: Service.name })
  service_id: Types.ObjectId;

  @Prop({ type: Object })  
  details: Object;

  @Prop({ type: Number })
  ref_price: number;

  @Prop({ type: [ServiceDetailMediaSchema], default: null }) 
  multimedia: ServiceDetailMedia[];
}

export const ServiceDetailSchema = SchemaFactory.createForClass(ServiceDetail);