import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Maintenance } from '../schema/maintenance.schema';
import { Model } from 'mongoose';
import { CreateMaintenanceDto } from '../dto';
import { SF_MAINTENANCE } from 'src/core/utils/searchable-fields';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<Maintenance>,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto): Promise<Maintenance> {
    try {
      const maintenance = new this.maintenanceModel(createMaintenanceDto);
      return await maintenance.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error creating maintenance: ${error.message}`);
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Maintenance[] }> {
    try {
      const filter = search
        ? {
            $or: SF_MAINTENANCE.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.maintenanceModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.maintenanceModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding maintenance with pagination: ${error.message}`,
      );
    }
  }

  async findOne(maintenance_id: string): Promise<Maintenance> {
    try {
      const maintenance = await this.maintenanceModel.findOne({
        _id: maintenance_id,
      });
      if (!maintenance) {
        throw new BadRequestException('Mantenimiento no encontrado');
      }

      return maintenance;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding maintenance: ${error.message}`,
      );
    }
  }
}
