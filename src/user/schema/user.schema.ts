import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Estado, Roles, DocType } from '../../core/constants/app.constants';

@Schema({ collection: 'User' })
export class User {
  @Prop({ length: 255, nullable: true })
  auth_id: string;

  @Prop({ length: 255, unique: true }) 
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop({ length: 255 }) 
  fullName: string;

  @Prop({ required: true }) 
  phone: string;

  @Prop({ enum: DocType, nullable: true })
  document_type: DocType;

  @Prop({ length: 255, nullable: true }) 
  document_number: string;

  @Prop({ enum: Roles }) 
  role: Roles;

  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  estado: string;
  
  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
