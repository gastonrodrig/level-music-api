import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Worker_type } from '../schema/worker-type.schema';
import { CreateWorkerTypeDto, UpdateWorkerTypeDto } from '../dto';

@Injectable()
export class WorkerTypeService {
  constructor(
    @InjectModel(Worker_type.name)
    private workerTypeModel: Model<Worker_type>,
  ) {}

  async create(createWorkerTypeDto: CreateWorkerTypeDto): Promise<Worker_type> {
    try {
      const worker = await this.workerTypeModel.create(createWorkerTypeDto);
      return await worker.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating worker: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Worker_type[]> {
    try {
      return await this.workerTypeModel.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding users: ${error.message}`,
      );
    }
  }

  async findOne(workerType_id: string): Promise<Worker_type> {
    try {
      const workerType = await this.workerTypeModel.findOne({
        _id: workerType_id,
      });
      if (!workerType) {
        throw new BadRequestException('Tipo de trabajador no encontrado');
      }

      return workerType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding workerType: ${error.message}`,
      );
    }
  }

  async update(
    workerType_id: string,
    updateWorkerTypeDto: UpdateWorkerTypeDto,
  ) {
    const workerType = await this.workerTypeModel.findOne({
      _id: workerType_id,
    });
    if (!workerType) {
      throw new BadRequestException('Tipo de trabajador no encontrado');
    }

    Object.assign(workerType, updateWorkerTypeDto);
    return await workerType.save();
  }

  async remove(workerType_id: string) {
    const workerType = await this.workerTypeModel.findOneAndDelete({
      _id: workerType_id,
    });
    if (!workerType) {
      throw new BadRequestException('Tipo de trabajador no encontrado');
    }

    return { success: true };
  }
}
