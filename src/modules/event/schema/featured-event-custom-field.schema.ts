import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ _id: false }) 
export class FeaturedEventCustomField {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;
}

export const FeaturedEventCustomFieldSchema = SchemaFactory.createForClass(FeaturedEventCustomField);