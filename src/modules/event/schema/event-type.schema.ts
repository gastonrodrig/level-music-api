import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { CategoryType } from "../enum";
import { Estado } from "../../../core/constants/app.constants";
import { EventTypeCustomFieldDto } from "./event-type-custom-field.schema";

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

  @Prop({ type: [EventTypeCustomFieldDto], required: false })
  attributes: EventTypeCustomFieldDto[];

  @Prop({ default: Date.now })
  created_at: Date;
  
  @Prop({ default: Date.now })
  updated_at: Date;
}

export const EventTypeSchema = SchemaFactory.createForClass(EventType);