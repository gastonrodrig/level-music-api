import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { DayOfWeek, ResourceType } from "../enum";
import { Resource } from "src/modules/resources/schema";

@Schema({ collection: 'event-assignations' })
export class Assignation {
  @Prop({ length: 255 })
  available_from: string;

  @Prop({ length: 255 })
  available_to: string;

  @Prop({ enum: DayOfWeek })
  day_of_week?: DayOfWeek;

  @Prop({ enum: ResourceType })
  resource_type?: ResourceType;

  @Prop({ type: Types.ObjectId, required: true, ref: Event.name })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: Worker.name })
  worker: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: Resource.name })
  resource: Types.ObjectId;

  @Prop({ default: Date.now })
  assigned_at: Date;
}

export const AssignationSchema = SchemaFactory.createForClass(Assignation);