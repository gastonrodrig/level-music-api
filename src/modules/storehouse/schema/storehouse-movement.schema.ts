import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { StoreMovementType } from "../enum";
import { LocationType } from 'src/modules/equipments/enum';
import { Estado } from 'src/core/constants/app.constants';
import { Types } from "mongoose";
import { Equipment } from "src/modules/equipments/schema/equipment.schema";
import { Event } from "src/modules/event/schema/event.schema";

@Schema({ collection: 'storehouse-movements' })
export class StorehouseMovement {
  @Prop({ type: Types.ObjectId, ref: Equipment.name, required: true })
  equipment: string;

  @Prop({ type: Types.ObjectId, ref: Event.name, required: true })
  event: string;

  @Prop({ enum: LocationType, required: true })
  destination: LocationType;

  @Prop({ type: String, required: true, index: true })
  code: string;

  @Prop({ enum: Estado, default: Estado.ACTIVO })
  state: Estado;

  @Prop({ enum: StoreMovementType, nullable: true })
  movement_type: StoreMovementType;

  @Prop({ default: Date.now })
  movement_date: Date;
}

export const StorehouseMovementSchema = SchemaFactory.createForClass(StorehouseMovement);