import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Estado, Roles } from '../enum';

@Schema({ collection: 'User' })
export class User {
  @Prop() uid: string;
  @Prop() email: string;
  @Prop() displayName: string;
  @Prop({ enum: Estado, default: Estado.HABILITADO }) estado: string;
  @Prop({ enum: Roles }) rol: Roles;
}

export const UserSchema = SchemaFactory.createForClass(User);
