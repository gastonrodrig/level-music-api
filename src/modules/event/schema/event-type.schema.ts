import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { CategoryType } from "../enum/category-type";
import { Estado } from "../../../core/constants/app.constants";

@Schema({ collection: 'event-types' })
export class EventType {
  @Prop({ length: 255 })
  type: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ required: true, enum: CategoryType })
  category: CategoryType;

  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  status: string;

  @Prop({ default: Date.now })
  created_at: Date;
  
  @Prop({ default: Date.now })
  updated_at: Date;
}

export const EventTypeSchema = SchemaFactory.createForClass(EventType);