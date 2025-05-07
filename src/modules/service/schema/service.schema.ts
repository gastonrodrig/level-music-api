import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Estado } from "src/core/constants/app.constants";

@Schema({ collection: 'Service' })
export class Service {

  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ length: 255 })
  price: string;

  @Prop({ required: true, enum: Estado })
  status: Estado;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Provider' })
  providerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'EventType' })
  ServiceTypeId: Types.ObjectId;
  
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
export const ServiceSchema = SchemaFactory.createForClass(Service);