import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MovementType } from "../enum";
import { Types } from "mongoose";

@Schema({ collection: 'storehouse-movements' })
export class Storehouse_Movement {
  @Prop({ type: Types.ObjectId, ref: 'resources' })
  resource_id: string;

  @Prop({ type: Types.ObjectId, ref: 'events' })
  event_id: string;

  @Prop({ enum: MovementType, nullable: true })
  movement_type: MovementType;

  @Prop({ default: Date.now })
  movement_date: Date;
}
 export const Storehouse_MovementSchema = SchemaFactory.createForClass(Storehouse_Movement);