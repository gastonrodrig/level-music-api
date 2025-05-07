import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Estado } from "src/core/constants/app.constants";

@Schema({ collection: 'Provider' })
export class Provider {
  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ length: 255 })
  contact_name: string;

  @Prop({ length: 255 })
  phone: string;

  @Prop({ length: 255 })
  email: string;

  @Prop({ required: true, enum: Estado, default: Estado.ACTIVO })
  status: Estado;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}
export const ProviderSchema = SchemaFactory.createForClass(Provider);

ProviderSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

ProviderSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});
