import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MovementType } from "../enum/MovementType";
import { Types } from "mongoose";

@Schema({ collection: 'StorehouseMovement' })
export class StorehouseMovement {

  @Prop({ type: Types.ObjectId, ref: 'Equipment' })
  equipment_id: string;

  @Prop({ type: Types.ObjectId, ref: 'Equipment' })
  event_id: string;

  @Prop({ enum: MovementType, nullable: true })
  movement_type: MovementType;

  @Prop({ default: Date.now })
  movement_date: Date;

}
 export const StorehouseMovementSchema = SchemaFactory.createForClass(StorehouseMovement);