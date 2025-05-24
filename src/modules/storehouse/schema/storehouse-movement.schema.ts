import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MovementType } from "../enum";
import { Types } from "mongoose";

@Schema({ collection: 'storehouse-movements' })
export class StorehouseMovement {
  @Prop({ type: Types.ObjectId, ref: 'resources' })
  resource_id: string;

  @Prop({ type: Types.ObjectId, ref: 'events' })
  event_id: string;

  @Prop({ enum: MovementType, nullable: true })
  movement_type: MovementType;

  @Prop({ default: Date.now })
  movement_date: Date;
}
 export const StorehouseMovementSchema = SchemaFactory.createForClass(StorehouseMovement);