import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StorehouseMovement } from '../schema/storehouse_movement.schema';
import { Model } from 'mongoose';
import { CreateStorehouseMovementDto } from '../dto';

@Injectable()
export class StorehouseMovementService {
  constructor(
    @InjectModel(StorehouseMovement.name)
    private storehouseMovementModel: Model<StorehouseMovement>,
  ) {}

  async create(
    createStorehouseMovementDto: CreateStorehouseMovementDto,
  ): Promise<StorehouseMovement> {
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

  async findAll(): Promise<StorehouseMovement[]> {
    try {
      return await this.storehouseMovementModel.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding storehouse movements: ${error.message}`,
      );
    }
  }

  async findOne(storehouseMovement_id: string): Promise<StorehouseMovement> {
    try {
      const storehouseMovement = await this.storehouseMovementModel.findOne({
        _id: storehouseMovement_id,
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

  async remove(storehouseMovement_id: string) {
    try {
      const movement = await this.storehouseMovementModel.findOneAndDelete({
        _id: storehouseMovement_id,
      });

      if (!movement) {
        throw new NotFoundException('Movimiento de almacén no encontrado');
      }

      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error removing storehouse movement: ${error.message}`,
      );
    }
  }
}
