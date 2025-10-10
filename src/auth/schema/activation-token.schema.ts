import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'activation-tokens' })
export class ActivationToken {
  @Prop({ required: true }) 
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true }) 
  token: string;

  @Prop({ required: true }) 
  expiresAt: Date;
  
  @Prop({ default: false }) 
  used: boolean;
}

export type ActivationTokenDocument = HydratedDocument<ActivationToken>;
export const ActivationTokenSchema =
  SchemaFactory.createForClass(ActivationToken);
ActivationTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { used: true } },
);
