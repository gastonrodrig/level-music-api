import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipment } from '../schema/equipment.schema';
import { CreateEquipmentDto} from '../dto';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectModel(Equipment.name)
    private equipmentModel: Model<Equipment>
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
      const Equipment = await this.equipmentModel.create(createEquipmentDto);
      return await Equipment.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error creating user: ${error.message}`);
    }
  

  
  async findAll(): Promise<Equipment[]> {
    try {
      return await this.equipmentModel.find();
    } catch (error) {
      throw new InternalServerErrorException(`Error finding users: ${error.message}`);
    }
  }

  async findOne(equipment_id: string): Promise<Equipment> {
    try {
      const equipment = await this.equipmentModel.findOne({ uid: equipment_id });
      if (!equipment) {
        throw new BadRequestException('Usuario no encontrado');
      }

      return equipment as unknown as Equipment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error finding user: ${error.message}`);
    }
  }

  async remove(equipment_id: string) {
    const user = await this.equipmentModel.findOneAndDelete({ _id: equipment_id });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return { success: true };
  }
}
