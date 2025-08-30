import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Estado, Roles, DocType } from '../../../core/constants/app.constants';

@Schema({ collection: 'users' })
export class User {
  @Prop({ length: 255, required: false })
  auth_id: string;

  @Prop({ length: 255, unique: true }) 
  email: string;

  @Prop({ length: 255, nullable: true }) 
  first_name: string;

  @Prop({ length: 255, nullable: true }) 
  last_name: string;

  @Prop({ nullable: true }) 
  phone: string;

  @Prop({ enum: DocType, default: DocType.DNI, nullable: true })
  document_type: DocType;

  @Prop({ length: 255, nullable: true }) 
  document_number: string;

  @Prop({ enum: Roles }) 
  role: Roles;

  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  status: string;

  @Prop({ required: false, default: null })
  needs_password_change?: boolean;

  @Prop({ required: true, default: false })
  created_by_admin: boolean;
  
  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({ length: 255, nullable: true })
  profile_picture: string;
  
  @Prop({ type: Boolean, default: false })
  extraData: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
