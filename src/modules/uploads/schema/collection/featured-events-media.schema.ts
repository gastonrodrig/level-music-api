import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { FeaturedEvent } from 'src/modules/event/schema';

@Schema({ collection: 'featured-events-media' })
export class FeaturedEventsMedia {
  @Prop({ length: 255 })
  url: string;

  @Prop({ length: 255 })
  name: string;

  @Prop()
  size: number;

  @Prop({ length: 255 })
  storage_path: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'FeaturedEvent' })
  featured_event: Types.ObjectId;

  @Prop()
  order: number;

  @Prop({ default: false })
  is_cover: boolean;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const FeaturedEventsMediaSchema = SchemaFactory.createForClass(FeaturedEventsMedia);
