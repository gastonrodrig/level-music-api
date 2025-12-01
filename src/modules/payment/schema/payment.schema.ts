import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaymentType, PaymentMethod, PaymentStatus } from '../enum';
import { PaymentSchedule } from './payment-schedules.schema';
import { Event } from 'src/modules/event/schema';
import { User } from 'src/modules/user/schema';

@Schema({ collection: 'payments' })
export class Payment {
  @Prop({ required: true, enum: PaymentType })
  payment_type: PaymentType; 

  @Prop({ required: true, enum: PaymentMethod })
  payment_method: PaymentMethod; 

  @Prop({ required: true })
  amount: number; 

  @Prop()
  operation_number?: string;

  @Prop()
  voucher_url?: string;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDIENTE })
  status: PaymentStatus;

  @Prop({ type: Types.ObjectId, ref: Event.name, required: true })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: PaymentSchedule.name })
  schedule?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ type: Date, nullable: true })
  approved_at?: Date;

  @Prop({ type: Boolean, default: false })
  has_issues?: boolean;

  @Prop({ type: Array, nullable: true })
  issues?: Array<{
    category: string;
    comments: string;
    reported_at: Date;
  }>;

  @Prop({ type: String, nullable: true })
  mercadopago_id?: string;

  @Prop({ type: String, nullable: true })
  mercadopago_status?: string;

  @Prop({ type: Object, nullable: true })
  mercadopago_response?: any;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
