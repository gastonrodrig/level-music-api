import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false }) 
export class CustomField {
  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  description: string;
}
