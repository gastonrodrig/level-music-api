import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { 
  FeaturedEventCustomField, 
  FeaturedEventCustomFieldSchema,
  Event
} from "./";
import { Types } from "mongoose";

@Schema({ collection: 'featured-events' })
export class FeaturedEvent {
  @Prop({ type: Types.ObjectId, required: true, ref: Event.name })
  event: Types.ObjectId;

  @Prop({ length: 255 })
  title: string;

  @Prop({ length: 255 })
  featured_description: string;

  @Prop({ length: 255 })
  cover_image: string;

  @Prop({ type: [FeaturedEventCustomFieldSchema] })
  services: FeaturedEventCustomField[];

  @Prop({ default: Date.now })
  created_at: Date;
  
  @Prop({ default: Date.now })
  updated_at: Date;
}

export const FeaturedEventSchema = SchemaFactory.createForClass(FeaturedEvent);