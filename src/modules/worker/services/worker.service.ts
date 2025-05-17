import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Worker } from '../schema/worker.schema';
import { CreateWorkerDto, UpdateWorkerDto } from '../dto';
import { WorkerType } from '../schema/worker-type.schema';
import { SF_WORKER } from 'src/core/utils/searchable-fields';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(Worker.name)
    private workerModel: Model<Worker>,
    @InjectModel(WorkerType.name)
    private workerTypeModel: Model<WorkerType>,
  ) {}

  async create(createWorkerDto: CreateWorkerDto): Promise<Worker> {
    try {
      const worker_type = await this.workerTypeModel.findById(createWorkerDto.worker_type_id)
    if(!worker_type){
      throw new BadRequestException('Tipo de trabajador no encontrado');
    }
      const worker = await this.workerModel.create(createWorkerDto);
      return await worker.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating worker: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Worker[]> {
    try {
      return await this.workerModel.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding workers: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Worker[] }> {
    try {
      const filter = search
      ? {
          $or: SF_WORKER.map(field => ({
            [field]: { $regex: search, $options: 'i' }
          })),
        }
      : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.workerModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.workerModel
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

  async findOne(worker_id: string): Promise<Worker> {
    try {
      const worker = await this.workerModel.findOne({ _id: worker_id });
      if (!worker) {
        throw new BadRequestException('Trabajador no encontrado');
      }

      return worker;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding worker: ${error.message}`,
      );
    }
  }

  async update(worker_id: string, updateWorkerDto: UpdateWorkerDto) {
    const worker = await this.workerModel.findOne({ _id: worker_id });
    if (!worker) {
      throw new BadRequestException('Trabajador no encontrado');
    }

    Object.assign(worker, updateWorkerDto);
    return await worker.save();
  }
}
