import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Worker } from '../schema';
import { CreateWorkerDto, UpdateWorkerDto } from '../dto';
import { WorkerType } from '../schema';
import { SF_WORKER } from 'src/core/utils';
import { User } from 'src/modules/user/schema';
import { AuthService } from 'src/modules/firebase/services';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(Worker.name)
    private workerModel: Model<Worker>,
    @InjectModel(WorkerType.name)
    private workerTypeModel: Model<WorkerType>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private authService: AuthService,
  ) {}

  async create(createWorkerDto: CreateWorkerDto): Promise<Worker> {
    try {
      const worker_type = await this.workerTypeModel.findById(createWorkerDto.worker_type_id);
      if (!worker_type) throw new BadRequestException('Tipo de trabajador no encontrado');

      let auth_id: string | null = null;

      // Solo crear en Firebase si corresponde
      if (worker_type.name === 'Almacenero' || worker_type.name === 'Transportista') {
        const firebaseResult = await this.authService.createUserWithEmail({
          email: createWorkerDto.email,
          password: createWorkerDto.password,
        });

        if (!firebaseResult.success) {
          throw new BadRequestException(firebaseResult.message);
        }

        auth_id = firebaseResult.uid;

        // Crear User
        const newUser = new this.userModel({
          auth_id: auth_id,
          email: createWorkerDto.email,
          phone: createWorkerDto.phone,
          document_type: createWorkerDto.document_type,
          document_number: createWorkerDto.document_number,
          first_name: createWorkerDto.first_name,
          last_name: createWorkerDto.last_name,
          role: createWorkerDto.role,
          status: createWorkerDto.status,
          created_by_admin: true,
          needs_password_change: true,
          profile_picture: null
        });

        const user = await newUser.save();

        // Crear Worker en Mongo
        const worker = new this.workerModel({
          worker_type: worker_type._id,
          user: user._id,
          worker_type_name: worker_type.name,
          first_name: createWorkerDto.first_name,
          last_name: createWorkerDto.last_name,
          role: createWorkerDto.role,
          status: createWorkerDto.status,
        });

        return await worker.save();
      } else {
        const worker = new this.workerModel({
          worker_type: worker_type._id,
          worker_type_name: worker_type.name,
          first_name: createWorkerDto.first_name,
          last_name: createWorkerDto.last_name,
          role: createWorkerDto.role,
          status: createWorkerDto.status,
        });

        return await worker.save();
      }
    } catch (error) {
      throw new InternalServerErrorException(`Error creating worker: ${error.message}`);
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
    try {
      const updatedWorker = await this.workerModel.findOneAndUpdate(
        { _id: worker_id },
        updateWorkerDto,
        { new: true }
      );

      if (!updatedWorker) {
        throw new NotFoundException(`Worker not found`);
      }

      return updatedWorker;
    } catch (error) {
      throw new InternalServerErrorException(`Error updating worker: ${error.message}`);
    }
  }
}
