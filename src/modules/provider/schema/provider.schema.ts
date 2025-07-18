import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Estado } from "src/core/constants/app.constants";

@Schema({ collection: 'providers' })
export class Provider {
  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  contact_name: string;

  @Prop({ length: 255 })
  phone: string;

  @Prop({ length: 255 })
  email: string;

  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  status: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}
export const ProviderSchema = SchemaFactory.createForClass(Provider);