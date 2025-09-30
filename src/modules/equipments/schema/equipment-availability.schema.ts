import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ collection: 'equipment-availability' })
export class EquipmentAvailability{
  @Prop({ type: Types.ObjectId, ref: 'Equipment', required: true })
  equipment: Types.ObjectId;

  @Prop({ required: true })
  date: Date;
}

export const EquipmentAvailabilitySchema = SchemaFactory.createForClass(EquipmentAvailability);