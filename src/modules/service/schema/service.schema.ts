import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { StatusType } from "../enum/statusType";
import { Types } from "mongoose";

@Schema({ collection: 'Service' })
export class Service {

  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ length: 255 })
  price: string;

  @Prop({ required: true, enum: StatusType })
  status: StatusType;

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