import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Estado } from "src/core/constants/app.constants";

@Schema({ collection: 'services' })
export class Service {
  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  status: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Provider' })
  provider: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'ServiceType' })
  service_type: Types.ObjectId;
  
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
