import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StorehouseMovement } from '../schema/storehouse-movement.schema';
import { Model } from 'mongoose';
import { CreateStorehouseMovementDto } from '../dto';
import { SF_STOREHOUSE_MOVEMENT } from 'src/core/utils/searchable-fields';

@Injectable()
export class StorehouseMovementService {
  constructor(
    @InjectModel(StorehouseMovement.name)
    private storehouseMovementModel: Model<StorehouseMovement>,
  ) {}

  async create(createStorehouseMovementDto: CreateStorehouseMovementDto): Promise<StorehouseMovement> {
    try {
      const storehouseMovement = await this.storehouseMovementModel.create(
        createStorehouseMovementDto,
      );
      return await storehouseMovement.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating storehouse movement: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: StorehouseMovement[] }> {
    try {
      const filter = search
      ? {
          $or: SF_STOREHOUSE_MOVEMENT.map(field => ({
            [field]: { $regex: search, $options: 'i' }
          })),
        }
      : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.storehouseMovementModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.storehouseMovementModel
          .countDocuments(filter)
          .exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding storehouse movement with pagination: ${error.message}`,
      );
    }
  }

  async findOne(storehouseMovementId: string): Promise<StorehouseMovement> {
    try {
      const storehouseMovement = await this.storehouseMovementModel.findOne({
        _id: storehouseMovementId,
      });

      if (!storehouseMovement) {
        throw new NotFoundException('Movimiento de almacén no encontrado');
      }

      return storehouseMovement;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding storehouse movement: ${error.message}`,
      );
    }
  }
}
