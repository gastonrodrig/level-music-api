import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { CategoryType } from "../enum/categoryType";

@Schema({ collection: 'EventType' })
export class EventType {

    @Prop({ length: 255 })
    type: string;
     
    @Prop({ length: 255 })
    description: string;

    @Prop({ required: true, enum: CategoryType  })
    category: CategoryType;

    @Prop({ default: Date.now })
    created_at: Date;
    
    @Prop({ default: Date.now })
    updated_at: Date;

}
export const EventTypeSchema = SchemaFactory.createForClass(EventType);