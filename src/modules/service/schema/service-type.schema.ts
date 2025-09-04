import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Estado } from "src/core/constants/app.constants";
import { ServiceTypeCustomField } from "./service-type-custom-field.schema";
import { CategoryType } from "../enum";


@Schema({ collection: 'service-types' })
export class ServiceType {
  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ enum: CategoryType, required: true })
  category: CategoryType;

  @Prop({ enum: Estado, default: Estado.ACTIVO })
  status: string;

  @Prop({ type: [ServiceTypeCustomField], required: false })
  attributes: ServiceTypeCustomField[];

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ServiceTypeSchema = SchemaFactory.createForClass(ServiceType);