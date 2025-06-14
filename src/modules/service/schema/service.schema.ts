import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Estado } from "src/core/constants/app.constants";
import { Provider } from "src/modules/provider/schema";
import { ServiceType } from "./service-type.schema";
import { Transform } from "class-transformer";

@Schema({ collection: 'services' })
export class Service {
  @Prop({ enum: Estado, default: Estado.ACTIVO }) 
  status: string;

  @Prop({ type: Types.ObjectId, ref: Provider.name })
  provider: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: ServiceType.name })
  service_type: Types.ObjectId;
  
  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({ type: String })
  provider_name: string;

  @Prop({ type: String })
  service_type_name: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);