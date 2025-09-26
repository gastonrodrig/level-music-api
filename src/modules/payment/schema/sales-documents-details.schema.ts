import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SalesDocument } from './sales-documents.schema';

@Schema({ collection: 'sales_documents_details' })
export class SalesDocumentDetail {
  @Prop({ length: 255 })
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ type: Number, nullable: true })
  quantity?: number;

  @Prop({ type: Number, nullable: true })
  unit_price?: number;

  @Prop({ type: Number, nullable: true })
  total_price?: number;

  @Prop({ type: Types.ObjectId, required: true, ref: SalesDocument.name })
  sale_document: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const SalesDocumentDetailSchema = SchemaFactory.createForClass(SalesDocumentDetail);
