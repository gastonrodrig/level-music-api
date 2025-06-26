import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false }) // No necesitas _id en campos embebidos
export class CustomField {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['texto corto', 'numérico', 'booleano', 'fecha'] })
  type: string;

  @Prop({ default: false })
  required: boolean;
}