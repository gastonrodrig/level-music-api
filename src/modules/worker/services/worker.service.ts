import {
  BadRequestException,
  HttpException,
  HttpStatus,
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
import { errorCodes } from 'src/core/common';
import { generateRandomPassword } from 'src/core/utils';
import { Estado } from 'src/core/constants/app.constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(Worker.name)
    private workerModel: Model<Worker>,
    @InjectModel(WorkerType.name)
    private workerTypeModel: Model<WorkerType>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectQueue('temporal-credentials')
    private temporalCredentialsQueue: Queue,
    private authService: AuthService,
  ) {}

  async create(createWorkerDto: CreateWorkerDto): Promise<Worker> {
    try {
      // Validar email y documento únicos; y tipo de trabajador existente
      const [workerType, existingEmail, existingDoc] = await Promise.all([
        this.workerTypeModel.findById(createWorkerDto.worker_type_id),
        this.userModel.findOne({ email: createWorkerDto.email }),
        this.userModel.findOne({
          document_number: createWorkerDto.document_number,
        }), 
      ]);

      if (!workerType) {
        throw new HttpException(
          {
            code: errorCodes.WORKER_TYPE_NOT_FOUND,
            message: `El tipo de trabajador "${createWorkerDto.worker_type_id}" no existe.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingEmail) {
        throw new HttpException(
          {
            code: errorCodes.EMAIL_ALREADY_EXISTS,
            message: 'El correo ya fue registrado previamnente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingDoc) {
        throw new HttpException(
          {
            code: errorCodes.DOCUMENT_NUMBER_ALREADY_EXISTS,
            message: 'El número de documento ya fue registrado previamente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Solo crear en Firebase si corresponde
      if (
        workerType.name === 'Personal Externo' ||
        workerType.name === 'Transportista'
      ) {
        // Generar contraseña aleatoria
        const password = generateRandomPassword();

        // Crear usuario en Firebase
        const firebaseResult = await this.authService.createUserWithEmail({
          email: createWorkerDto.email,
          password,
        });

        if (!firebaseResult.success || !firebaseResult.uid) {
          throw new InternalServerErrorException(firebaseResult.message);
        }

        // Crear usuario en la BD
        const userToCreate = {
          ...createWorkerDto,
          auth_id: firebaseResult.uid,
          status: Estado.ACTIVO,
          created_by_admin: true,
          needs_password_change: true,
          is_extra_data_completed: true,
          client_type: null
        };

        const newUser = new this.userModel(userToCreate);
        const user = await newUser.save();

        // Encola el envío de correo con credenciales para envío en background
        await this.temporalCredentialsQueue.add('sendTemporalCredentials', {
          to: createWorkerDto.email,
          email: createWorkerDto.email,
          password,
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 1000,
          removeOnFail: 100,
        });

        // Crear trabajador en la BD
        const workerToCreate = {
          ...createWorkerDto,
          worker_type: workerType._id,
          user: user._id,
          worker_type_name: workerType.name,
          status: Estado.ACTIVO
        };

        const worker = new this.workerModel(workerToCreate);
        return await worker.save();
      } else {
        // Crear trabajador en la BD (sin Firebase y usuario)
        const workerToCreate = {
          ...createWorkerDto,
          worker_type: workerType._id,
          worker_type_name: workerType.name,
          status: Estado.ACTIVO
        };

        const worker = new this.workerModel(workerToCreate);
        return await worker.save();
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error creating worker: ${error.message}`,
      );
    }
  }

  async findAllActive(): Promise<Worker[]> {
    try {
      const workers = await this.workerModel
        .find({ status: Estado.ACTIVO }) 
        .exec();

      return workers;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding active workers: ${error.message}`,
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
            $or: SF_WORKER.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
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
        this.workerModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding workers with pagination: ${error.message}`,
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
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Error finding worker: ${error.message}`);
    }
  }

  async update(worker_id: string, updateWorkerDto: UpdateWorkerDto) {
    try {
      // Validar email y documento únicos
      const [existingEmail, existingDocumentNumber] = await Promise.all([
        this.workerModel.findOne({ 
          email: updateWorkerDto.email,
          _id: { $ne: worker_id },
        }),
        this.workerModel.findOne({
          document_number: updateWorkerDto.document_number,
          _id: { $ne: worker_id },
        }),
      ])

      if (existingEmail) {
        throw new HttpException(
          {
            code: errorCodes.EMAIL_ALREADY_EXISTS,
            message: 'El correo ya fue registrado previamnente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingDocumentNumber) {
        throw new HttpException(
          {
            code: errorCodes.DOCUMENT_NUMBER_ALREADY_EXISTS,
            message: 'El número de documento ya fue registrado previamente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Buscar trabajador
      const worker = await this.workerModel.findById(worker_id);

      // Buscar tipo de trabajador
      const workerType = await this.workerTypeModel.findById(worker.worker_type);

      // Si es Personal Externo o Transportista, actualizar también el usuario y Firebase
      if (
        workerType.name === 'Personal Externo' ||
        workerType.name === 'Transportista'
      ) {
        const user = await this.userModel.findById(worker.user);

        // Si no existe el usuario, lanzar excepción
        if (!user) throw new BadRequestException(`User not found`);

        // Actualizar usuario en Firebase
        await this.authService.updateUserEmail(user.auth_id, {
          email: updateWorkerDto.email,
        });

        // Actualizar usuario en la BD
        await this.userModel.findByIdAndUpdate(worker.user, {
          email: updateWorkerDto.email,
          phone: updateWorkerDto.phone,
          document_type: updateWorkerDto.document_type,
          document_number: updateWorkerDto.document_number,
          first_name: updateWorkerDto.first_name,
          last_name: updateWorkerDto.last_name,
          status: updateWorkerDto.status,
        });
      }

      // Actualizar el trabajador
      const updatedWorker = await this.workerModel.findOneAndUpdate(
        { _id: worker_id },
        updateWorkerDto,
        { new: true },
      );
      
      // Si no se encontró el trabajador, lanzar excepción
      if (!updatedWorker) {
        throw new BadRequestException(`Worker not found`);
      }

      return updatedWorker;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error updating worker: ${error.message}`,
      );
    }
  }
}
