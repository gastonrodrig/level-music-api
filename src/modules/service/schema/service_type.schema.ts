import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema( { collection: 'ServiceType' })
export class ServiceType {
  @Prop({ length: 255 })  
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
export const ServiceTypeSchema = SchemaFactory.createForClass(ServiceType);