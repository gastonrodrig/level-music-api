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
import { SF_WORKER_TYPE } from 'src/core/utils/searchable-fields';

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

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Worker_type[] }> {
    try {
      // Notas:
      // 1) se filtra por nombre o descripción (Campos de la tabla)
      const filter = search
      ? {
          $or: SF_WORKER_TYPE.map(field => ({
            [field]: { $regex: search, $options: 'i' }
          })),
        }
      : {};

      // 2) se ordena por el campo que se pasa por parámetro (Ascendente o Descendente)
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

  async findOne(workerType_id: any): Promise<Worker_type> {
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
