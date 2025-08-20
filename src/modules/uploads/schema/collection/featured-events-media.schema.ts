import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'featured-events-media' })
export class FeaturedEventsMedia {
  _id: any

  @Prop({ length: 255 })
  url: string;

  @Prop({ length: 255 })
  name: string;

  @Prop()
  size: number;

  @Prop({ length: 255 })
  storage_path: string;

  @Prop({ type: Types.ObjectId, ref: 'FeaturedEvent', required: true })
  featured_event: Types.ObjectId;

  @Prop()
  order: number;

  @Prop({ default: false })
  isCover: boolean;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const FeaturedEventsMediaSchema = SchemaFactory.createForClass(FeaturedEventsMedia);
