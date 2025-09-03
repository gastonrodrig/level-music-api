import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkerType } from '../schema';
import { CreateWorkerTypeDto, UpdateWorkerTypeDto } from '../dto';
import { SF_WORKER_TYPE } from 'src/core/utils';
import { errorCodes } from 'src/core/common';

@Injectable()
export class WorkerTypeService {
  constructor(
    @InjectModel(WorkerType.name)
    private workerTypeModel: Model<WorkerType>,
  ) {}

  async create(createWorkerTypeDto: CreateWorkerTypeDto): Promise<WorkerType> {
    try {
      // Validar si el tipo de trabajador ya existe
      const existing = await this.workerTypeModel.findOne({
        name: createWorkerTypeDto.name,
      });
      if (existing) {
        throw new HttpException(
          {
            code: errorCodes.WORKER_TYPE_ALREADY_EXISTS,
            message: `El tipo de trabajador "${createWorkerTypeDto.name}" ya existe.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const worker = await this.workerTypeModel.create(createWorkerTypeDto);
      return await worker.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error creating worker type: ${error.message}`,
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

  async findAll(): Promise<WorkerType[]> {
    try {
      return await this.workerTypeModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error obteniendo todos los tipos de trabajador: ${error.message}`,
      );
    }
  }

  async findOne(worker_type_id: any): Promise<WorkerType> {
    try {
      const workerType = await this.workerTypeModel.findOne({
        _id: worker_type_id,
      });
      if (!workerType) {
        throw new NotFoundException(
          `Worker type with ID '${worker_type_id}' not found`,
        );
      }

      return workerType;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error finding worker type: ${error.message}`,
      );
    }
  }

  async update(
    worker_type_id: string,
    updateWorkerTypeDto: UpdateWorkerTypeDto,
  ) {
    try {
      // Validar que el tipo de trabajador no tenga el mismo nombre en otro registro
      const existingName = await this.workerTypeModel.findOne({
        name: updateWorkerTypeDto.name,
        _id: { $ne: worker_type_id },
      });

      if (existingName) {
        throw new HttpException(
          {
            code: errorCodes.WORKER_TYPE_ALREADY_EXISTS,
            message: `El tipo de trabajador "${updateWorkerTypeDto.name}" ya existe.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Actualizar el tipo de trabajador
      const updatedWorkerType = await this.workerTypeModel.findByIdAndUpdate(
        worker_type_id,
        updateWorkerTypeDto,
        { new: true },
      );

      // Si no se encontró, lanzar una excepción
      if (!updatedWorkerType) {
        throw new NotFoundException(
          `Worker type with ID ${worker_type_id} not found`,
        );
      }

      return updatedWorkerType;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error updating worker type: ${error.message}`,
      );
    }
  }
}
