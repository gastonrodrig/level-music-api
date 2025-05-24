import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

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

  @Prop({ type: Types.ObjectId, required: true, ref: 'events' })
  event_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'services' })
  service_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'service-details' })
  detail_id: Types.ObjectId;

  @Prop({ default: Date.now })
  assigned_at: Date;
}

export const EventServiceSchema = SchemaFactory.createForClass(EventService);