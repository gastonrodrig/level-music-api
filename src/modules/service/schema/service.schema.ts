import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Estado } from "src/core/constants/app.constants";

@Schema({ collection: 'services' })
export class Service {
  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ length: 255 })
  price: string;

  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  status: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'providers' })
  provider_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'service-types' })
  service_type_id: Types.ObjectId;
  
  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

ServiceSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});
