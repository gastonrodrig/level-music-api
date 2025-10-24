import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaymentType, PaymentMethod, PaymentStatus } from '../enum';
import { PaymentSchedule } from './payment-schedules.schema';
import { SalesDocument } from './sales-documents.schema';
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
  operation_number?: string; // Numero de operacion (manual)

  @Prop()
  voucher_url?: string; // Comprobante de pago (manual)

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDIENTE })
  status: PaymentStatus;

  @Prop({ type: Types.ObjectId, ref: Event.name })
  event?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: PaymentSchedule.name })
  schedule: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
