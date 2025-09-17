import { Prop, Schema } from "@nestjs/mongoose";
import { ServiceTypeCustomFieldType } from "../enum";

@Schema({ _id: false }) 
export class ServiceTypeCustomField {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ServiceTypeCustomFieldType })
  type: string;

  @Prop({ default: false })
  default: boolean;
}
