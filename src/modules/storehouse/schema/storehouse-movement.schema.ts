import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { StoreMovementType } from "../enum";
import { Types } from "mongoose";
import { Equipment } from "src/modules/equipments/schema/equipment.schema";
import { Event } from "src/modules/event/schema/event.schema";

@Schema({ collection: 'storehouse-movements' })
export class StorehouseMovement {
  @Prop({ type: Types.ObjectId, ref: Equipment.name, required: true })
  equipment: string;

  @Prop({ type: Types.ObjectId, ref: Event.name, required: true })
  event: string;

  @Prop({ enum: StoreMovementType, nullable: true })
  movement_type: StoreMovementType;

  @Prop({ default: Date.now })
  movement_date: Date;
}

export const StorehouseMovementSchema = SchemaFactory.createForClass(StorehouseMovement);