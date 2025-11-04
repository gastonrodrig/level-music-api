import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: 'equipment-prices' })
export class EquipmentPrice {
  
  @Prop({ required: true })
  season_number: number;

  @Prop({ required: true })
  reference_price: number;

  @Prop({ required: true })
  start_date: Date;

  @Prop({ required: true })
  end_date: Date;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const EquipmentPriceSchema = SchemaFactory.createForClass(EquipmentPrice);