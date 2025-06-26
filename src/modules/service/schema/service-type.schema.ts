import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Estado } from "src/core/constants/app.constants";
import { CustomField } from "./service-type-custom-field.schema";

@Schema({ collection: 'service-types' })
export class ServiceType {
  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ enum: Estado, default: Estado.ACTIVO })
  status: string;

  @Prop({ type: [CustomField], required: false })
  attributes: CustomField[];

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ServiceTypeSchema = SchemaFactory.createForClass(ServiceType);