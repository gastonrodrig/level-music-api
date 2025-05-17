import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LocationType, StatusType, ResourceType } from "../enum";

@Schema({ collection: 'resources' })
export class Resource {
  @Prop({ length: 255 }) 
  name: string;

  @Prop({ length: 255 }) 
  description: string;

  @Prop({ enum: ResourceType, default: ResourceType.SONIDO })
  resource_type: ResourceType; 

  @Prop({ required: true }) 
  serial_number: number;

  @Prop({ enum: StatusType, default: StatusType.EN_USO }) 
  status: string;

  @Prop({ enum: LocationType, default: LocationType.ALMACEN }) 
  location: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

ResourceSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

ResourceSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});
