import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MaintenanceType } from "../enum";
import { Types } from "mongoose";

@Schema({ collection: 'maintenances' })
export class Maintenance {
  @Prop({ enum: MaintenanceType, default: MaintenanceType.CORRECTIVO })
  type: MaintenanceType;

  @Prop({ length: 255 })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Resource' })
  resource: Types.ObjectId;

  @Prop({ default: Date.now })
  date: Date;
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance);