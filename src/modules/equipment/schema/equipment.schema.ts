import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LocationType } from "../enum/locationType";
import { StateType } from "../enum/stateType";
import { EquipmentType } from "../enum/equipmentType";

@Schema({ collection: 'Equipment' })
export class Equipment {
  @Prop({ length: 255 }) 
  name: string;
  
  @Prop({ length: 255, nullable: true }) 
  description: string;
  
  @Prop({ enum: EquipmentType, nullable: true })
  equipment_type: EquipmentType; 

  @Prop({ required: true }) 
  serial_number: number;
  
  @Prop({ enum: StateType, nullable: true }) 
  state: string;

  @Prop({ enum: LocationType, nullable: true }) 
  location: string;
  
  @Prop({ default: Date.now })
  created_at: Date;
  
  @Prop({ default: Date.now })
  updated_at: Date;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);