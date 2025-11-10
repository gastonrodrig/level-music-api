import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';
import { Equipment } from "./equipment.schema";

@Schema({ collection: 'equipment-prices' })
export class EquipmentPrice {
  @Prop({ type: Types.ObjectId, ref: Equipment.name, required: true })
  equipment: Types.ObjectId;

  @Prop({ required: true })
  season_number: number;

  @Prop({ required: true })
  reference_price: number;

  @Prop({ required: true })
  start_date: Date;

  @Prop({ default: null })
  end_date: Date;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const EquipmentPriceSchema = SchemaFactory.createForClass(EquipmentPrice);