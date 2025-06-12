import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Event } from "./event.schema";
import { Service } from "src/modules/service/schema/service.schema";
import { ServiceDetail } from "src/modules/service/schema/service-detail.schema";

@Schema({ collection: 'event-services' })
export class EventService {
  @Prop({ length: 255 })
  provider_name: string;

  @Prop({ length: 255 })
  service_type_name: string;

  @Prop({ type: Number })
  ref_price: number;

  @Prop({ type: Number })
  final_price: number;

  @Prop({ type: Types.ObjectId, required: true, ref: Event.name })
  event_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: Service.name })
  service_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: ServiceDetail.name })
  detail_id: Types.ObjectId;

  @Prop({ default: Date.now })
  assigned_at: Date;
}

export const EventServiceSchema = SchemaFactory.createForClass(EventService);