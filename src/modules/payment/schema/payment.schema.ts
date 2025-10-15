import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaymentType, PaymentMethod, PaymentStatus } from '../enum';
import { PaymentSchedule } from './payment-schedules.schema';
import { SalesDocument } from './sales-documents.schema';

@Schema({ collection: 'payments' })
export class Payment {
  @Prop({ required: true, enum: PaymentType })
  payment_type: PaymentType; 

  @Prop({ required: true, enum: PaymentMethod })
  method: PaymentMethod; 

  @Prop({ required: true })
  amount: number; 

  @Prop()
  operation_number?: string; // Numero de operacion (manual)

  @Prop()
  payment_reference?: string; // ID del pago en MercadoPago

  @Prop()
  proof_url?: string; // Comprobante de pago (manual)

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDIENTE })
  status: PaymentStatus;

  @Prop({ type: Types.ObjectId, ref: PaymentSchedule.name, required: true })
  schedule: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: SalesDocument.name })
  sales_document?: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
