import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Provider } from "src/modules/provider/schema";
import { ServiceType } from "./service-type.schema";

@Schema({ collection: 'services' })
export class Service {
  @Prop({ type: Types.ObjectId, ref: Provider.name })
  provider: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: ServiceType.name })
  service_type: Types.ObjectId;

  @Prop({ type: String })
  provider_name: string;

  @Prop({ type: String })
  service_type_name: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);