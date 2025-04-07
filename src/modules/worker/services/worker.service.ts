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
import { Worker_type } from '../schema/worker-type.schema';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(Worker.name)
    private workerModel: Model<Worker>,
    @InjectModel(Worker_type.name)
    private workerTypeModel: Model<Worker_type>,
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

  async remove(worker_id: string) {
    const worker = await this.workerModel.findOneAndDelete({ _id: worker_id });
    if (!worker) {
      throw new BadRequestException('Trabajador no encontrado');
    }

    return { success: true };
  }
}
