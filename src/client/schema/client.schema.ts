import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Estado } from '../../core/constants/app.constants';

@Schema({ 
  collection: 'Client',
  toJSON: {
    transform: function(ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Client {
  @Prop({ required: true, unique: true }) uid: string;
  @Prop({ required: true }) email: string;
  @Prop({ required: true }) fullName: string;
  @Prop({ required: true }) phone: string;
  @Prop({ required: true, unique: true }) documentNumber: string;
  @Prop({ enum: Estado, default: Estado.ACTIVO }) estado: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
