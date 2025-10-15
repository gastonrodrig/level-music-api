import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaymentType, PaymentMethod } from '../enum';
import { Event } from 'src/modules/event/schema';
import { User } from 'src/modules/user/schema';
import { PaymentSchedule } from './payment-schedules.schema';

@Schema({ collection: 'sales_documents' })
export class SalesDocument {
  @Prop({ unique: true, sparse: true, trim: true })
  sale_document_number: string;

  @Prop({ required: true, enum: PaymentType })
  type: PaymentType;

  @Prop({ type: Number })
  total_amount: number;

  @Prop({ required: true, enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Prop()
  operation_number?: string; // Numero de operacion (manual)

  @Prop()
  payment_reference?: string; // ID del pago en MercadoPago

  @Prop()
  proof_url?: string; // Comprobante de pago (manual)

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
