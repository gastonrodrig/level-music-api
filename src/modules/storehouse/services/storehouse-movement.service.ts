import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StorehouseMovement } from '../schema';
import { Model } from 'mongoose';
import { CreateStorehouseMovementDto } from '../dto';
import { SF_STOREHOUSE_MOVEMENT } from 'src/core/utils';
import { Event } from 'src/modules/event/schema';
import { Equipment } from 'src/modules/equipments/schema';

@Injectable()
export class StorehouseMovementService {
  constructor(
    @InjectModel(StorehouseMovement.name)
    private storehouseMovementModel: Model<StorehouseMovement>,
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
    @InjectModel(Equipment.name)
    private equipmentModel: Model<Equipment>,
  ) {}

  async create(createStorehouseMovementDto: CreateStorehouseMovementDto): Promise<StorehouseMovement> {
    try {
      const event = await this.eventModel.findById(createStorehouseMovementDto.event_id);
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      const equipment = await this.equipmentModel.findById(createStorehouseMovementDto.resource_id);
      if (!equipment) {
        throw new NotFoundException('Equipment not found');
      }

      const storehouseMovement = new this.storehouseMovementModel({
        ...createStorehouseMovementDto,
        event: event._id,
        equipment: equipment._id,
      });

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
