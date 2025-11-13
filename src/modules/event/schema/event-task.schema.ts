import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'event-tasks' })
export class EventTask extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  description?: string; 

  @Prop({ type: Types.ObjectId, ref: 'Event', required: false })
  event?: Types.ObjectId; 

  @Prop({ type: [Types.ObjectId], ref: 'EventSubtask', default: [] })
  subtasks: Types.ObjectId[]; 
}

export const EventTaskSchema = SchemaFactory.createForClass(EventTask);
