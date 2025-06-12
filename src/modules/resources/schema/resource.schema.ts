import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LocationType, ResourceStatusType, ResourceType } from "../enum";
import { Document } from "mongoose";

@Schema({ collection: 'resources' })
export class Resource extends Document {
  @Prop({ length: 255 }) 
  name: string;

  @Prop({ length: 255 })
  description: string;

  @Prop({ enum: ResourceType, default: ResourceType.SONIDO })
  resource_type: ResourceType; 

  @Prop({ required: true }) 
  serial_number: string;

  @Prop({ enum: ResourceStatusType, default: ResourceStatusType.DISPONIBLE, required: false }) 
  status?: ResourceStatusType;

  @Prop({ enum: LocationType, default: LocationType.ALMACEN, required: false }) 
  location?: LocationType;

  @Prop({ default: null })
  last_maintenance_date: Date;

  @Prop()
  next_maintenance_date: Date;

  @Prop() 
  maintenance_interval_days: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

// Hook para actualizar fecha de modificación
ResourceSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

ResourceSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});
