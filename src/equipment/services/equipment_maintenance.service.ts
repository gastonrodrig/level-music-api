import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EquipmentMaintenance } from '../schema/equipment_maintenance.schema';
import { Model } from 'mongoose';
import { CreateEquipmentMaintenanceDto } from '../dto';

@Injectable()
export class EquipmentMaintenanceService {
  constructor(
    @InjectModel(EquipmentMaintenance.name)
    private equipmenmaintenanceModel: Model<EquipmentMaintenance>,
  ) {}
  async create(
    createEquipmentMaintenanceDto: CreateEquipmentMaintenanceDto,
  ): Promise<EquipmentMaintenance> {
    const equipmentMaintenance = await this.equipmenmaintenanceModel.create(
      createEquipmentMaintenanceDto,
    );
    return await equipmentMaintenance.save();
  }

  catch(error) {
    throw new InternalServerErrorException(
      `Error creating equipment maintenance: ${error.message}`,
    );
  }
  async findAll(): Promise<EquipmentMaintenance[]> {
    try {
      return await this.equipmenmaintenanceModel.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding equipment maintenance: ${error.message}`,
      );
    }
  }

  async findOne(
    equipmentMaintenance_id: string,
  ): Promise<EquipmentMaintenance> {
    try {
      const equipmentMaintenance = await this.equipmenmaintenanceModel.findOne({
        _id: equipmentMaintenance_id,
      });
      if (!equipmentMaintenance) {
        throw new BadRequestException('Equipo en mantenimiento no encontrado');
      }

      return equipmentMaintenance as unknown as EquipmentMaintenance;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding equipment maintenance: ${error.message}`,
      );
    }
  }

  async remove(equipmentMaintenance_id: string) {
    const user = await this.equipmenmaintenanceModel.findOneAndDelete({
      uid: equipmentMaintenance_id,
    });
    if (!user) {
      throw new BadRequestException('Equipo en mantenimiento no encontrado');
    }
    return { success: true };
  }
  async;
}
