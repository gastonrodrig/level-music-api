import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Estado } from "src/core/constants/app.constants";

@Schema({ collection: 'Provider' })
export class Provider {
  @Prop({ length: 255 })
    name: string;

  @Prop({ length: 255 })
    description: string;

  @Prop({ length: 255 })
    address: string;

  @Prop({ length: 255 })
    phone: string;

  @Prop({ length: 255 })
    email: string;

  @Prop({ required: true, enum: Estado })
    status: Estado;

  @Prop({ default: Date.now })
    createdAt: Date;

  @Prop({ default: Date.now })
    updatedAt: Date;
}
export const ProviderSchema = SchemaFactory.createForClass(Provider);