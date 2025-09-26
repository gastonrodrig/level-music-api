import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Type } from '../enum';
import { Event } from 'src/modules/event/schema';
import { User } from 'src/modules/user/schema';
import { PaymentSchedule } from './payment-schedules.schema';

@Schema({ collection: 'sales_documents' })
export class SalesDocument {
  @Prop({ unique: true, sparse: true, trim: true })
  sale_document_number: string;

  @Prop({ type: Number, nullable: true })
  total_amount?: number;

  @Prop({ required: true, enum: Type })
  type: Type;

  @Prop({ type: Types.ObjectId, required: true, ref: Event.name })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: PaymentSchedule.name })
  schedule: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const SalesDocumentSchema = SchemaFactory.createForClass(SalesDocument);
