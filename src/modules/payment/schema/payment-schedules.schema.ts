import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaymentType, PaymentStatus } from '../enum';
import { Event } from 'src/modules/event/schema';

@Schema({ collection: 'payment-schedules' })
export class PaymentSchedule {
  @Prop({ required: true, enum: PaymentType })
  payment_type: PaymentType;

  @Prop({ required: true })
  due_date: Date;

  @Prop({ type: Number, nullable: true })
  total_amount?: number;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDIENTE })
  status: PaymentStatus;

  @Prop({ type: Types.ObjectId, required: true, ref: Event.name })
  event: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const PaymentScheduleSchema = SchemaFactory.createForClass(PaymentSchedule);
