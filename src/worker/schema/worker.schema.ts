import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'Worker_type' })
export class Worker_type {

  @Prop({ length: 255 }) 
  name: string;

  @Prop({ length: 255 }) 
  description: string;

  
  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const Worker_typeSchema = SchemaFactory.createForClass(Worker_type);
