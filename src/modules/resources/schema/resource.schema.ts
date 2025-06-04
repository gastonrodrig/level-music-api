import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LocationType, StatusType, ResourceType } from "../enum";

@Schema({ collection: 'resources' })
export class Resource {
  @Prop({ length: 255 }) 
  name: string;

  @Prop({ enum: ResourceType, default: ResourceType.EQUIPO })
  resource_type: ResourceType; 

  @Prop({ required: true }) 
  serial_number: string;

  @Prop({ enum: StatusType, default: StatusType.DISPONIBLE }) 
  status: string;

  @Prop({ enum: LocationType, default: LocationType.ALMACEN }) 
  location: string;

  @Prop()
  last_maintenance: string;

  @Prop({ default: Date.now })
  created_at: string;

  @Prop({ default: Date.now })
  updated_at: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

ResourceSchema.pre('save', function (next) {
  this.updated_at = new Date().toISOString();
  next();
});

ResourceSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date().toISOString() });
  next();
});
