import { Prop, Schema } from "@nestjs/mongoose";
import { CustomFieldType } from "../enum";

@Schema({ _id: false }) 
export class CustomField {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: CustomFieldType })
  type: string;

  @Prop({ default: false })
  required: boolean;
}
