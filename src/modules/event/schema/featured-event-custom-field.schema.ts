import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false }) 
export class FeaturedEventCustomField {
  @Prop({ required: true })
  title: string;

  @Prop({ default: false })
  description: string;
}