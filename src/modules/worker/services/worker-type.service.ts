import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkerType } from '../schema';
import { CreateWorkerTypeDto, UpdateWorkerTypeDto } from '../dto';
import { SF_WORKER_TYPE } from 'src/core/utils';

@Injectable()
export class WorkerTypeService {
  constructor(
    @InjectModel(WorkerType.name)
    private workerTypeModel: Model<WorkerType>,
  ) {}

  async create(createWorkerTypeDto: CreateWorkerTypeDto): Promise<WorkerType> {
    try {
      const worker = await this.workerTypeModel.create(createWorkerTypeDto);
      return await worker.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating worker: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: WorkerType[] }> {
    try {
      const filter = search
      ? {
          $or: SF_WORKER_TYPE.map(field => ({
            [field]: { $regex: search, $options: 'i' }
          })),
        }
      : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.workerTypeModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.workerTypeModel
          .countDocuments(filter)
          .exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding worker types with pagination: ${error.message}`,
      );
    }
  }

  async findOne(worker_type_id: any): Promise<WorkerType> {
    try {
      const workerType = await this.workerTypeModel.findOne({
        _id: worker_type_id,
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
    worker_type_id: string,
    updateWorkerTypeDto: UpdateWorkerTypeDto,
  ) {
    const workerType = await this.workerTypeModel.findOne({
      _id: worker_type_id,
    });
    if (!workerType) {
      throw new BadRequestException('Tipo de trabajador no encontrado');
    }

    Object.assign(workerType, updateWorkerTypeDto);
    return await workerType.save();
  }

  async remove(worker_type_id: string) {
    const workerType = await this.workerTypeModel.findOneAndDelete({
      _id: worker_type_id,
    });
    if (!workerType) {
      throw new BadRequestException('Tipo de trabajador no encontrado');
    }

    return { success: true };
  }
}
