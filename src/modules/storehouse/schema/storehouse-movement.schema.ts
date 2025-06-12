import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MovementType } from "../enum";
import { Types } from "mongoose";
import { Resource } from "src/modules/resources/schema/resource.schema";
import { Event } from "src/modules/event/schema/event.schema";

@Schema({ collection: 'storehouse-movements' })
export class StorehouseMovement {
  @Prop({ type: Types.ObjectId, ref: Resource.name, required: true })
  resource_id: string;

  @Prop({ type: Types.ObjectId, ref: Event.name, required: true })
  event_id: string;

  @Prop({ enum: MovementType, nullable: true })
  movement_type: MovementType;

  @Prop({ default: Date.now })
  movement_date: Date;
}
 export const StorehouseMovementSchema = SchemaFactory.createForClass(StorehouseMovement);