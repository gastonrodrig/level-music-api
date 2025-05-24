import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Multimedia {
  @Prop({ type: String })
  url: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  mimetype: string;

  @Prop({ type: Number })
  size: number;
}

export const MultimediaSchema = SchemaFactory.createForClass(Multimedia);
