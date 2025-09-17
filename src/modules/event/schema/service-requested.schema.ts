import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ServiceType } from 'src/modules/service/schema';

@Schema({ _id: false })
export class ServiceRequested {
  @Prop({ type: Types.ObjectId, ref: ServiceType.name, required: false, default: null })
  service_type_id?: Types.ObjectId | null;

  @Prop({ type: String, required: true })
  service_type_name: string;

  @Prop({ type: String })
  details?: string;
}

export const ServiceRequestedSchema = SchemaFactory.createForClass(ServiceRequested);
