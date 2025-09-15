import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ServiceType } from '../schema';
import { Model } from 'mongoose';
import { CreateServiceTypeDto, UpdateServiceTypeDto } from '../dto';
import { SF_SERVICE_TYPE } from 'src/core/utils';
import { errorCodes } from 'src/core/common';
import { Estado } from 'src/core/constants/app.constants';

@Injectable()
export class ServiceTypeService {
  constructor(
    @InjectModel(ServiceType.name)
    private serviceTypeModel: Model<ServiceType>,
  ) {}

  async create(
    createServiceTypeDto: CreateServiceTypeDto,
  ): Promise<ServiceType> {
    try {
      // Validar si el tipo de servicio ya existe
      const existing = await this.serviceTypeModel.findOne({
        name: createServiceTypeDto.name,
      });
      if (existing) {
        throw new HttpException(
          {
            code: errorCodes.SERVICE_TYPE_ALREADY_EXISTS,
            message: `El tipo de servicio "${createServiceTypeDto.name}" ya existe.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const serviceType =
        await this.serviceTypeModel.create(createServiceTypeDto);
      return await serviceType.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error creating service type: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<ServiceType[]> {
    try {
      const serviceTypes = await this.serviceTypeModel
        .find({ status: Estado.ACTIVO }) 
        .sort({ name: 1 }) 
        .exec();

      return serviceTypes;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding all service types: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: ServiceType[] }> {
    try {
      const filter = search
        ? {
            $or: SF_SERVICE_TYPE.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.serviceTypeModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.serviceTypeModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding service types with pagination: ${error.message}`,
      );
    }
  }

  async findOne(service_type_id: string): Promise<ServiceType> {
    try {
      const serviceType = await this.serviceTypeModel.findOne({
        _id: service_type_id,
      });
      if (!serviceType) {
        throw new NotFoundException(
          `Service type with ID '${service_type_id}' not found`,
        );
      }

      return serviceType;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error finding service type: ${error.message}`,
      );
    }
  }

  async update(
    service_type_id: string,
    updateServiceTypeDto: UpdateServiceTypeDto,
  ): Promise<ServiceType> {
    try {
      // Validar que el tipo de servicio no tenga el mismo nombre en otro registro
      const existingName = await this.serviceTypeModel.findOne({
        name: updateServiceTypeDto.name,
        _id: { $ne: service_type_id },
      });

      if (existingName) {
        throw new HttpException(
          {
            code: errorCodes.SERVICE_TYPE_ALREADY_EXISTS,
            message: `El tipo de servicio "${updateServiceTypeDto.name}" ya existe.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Actualizar el tipo de servicio
      const updatedServiceType = await this.serviceTypeModel.findByIdAndUpdate(
        service_type_id,
        updateServiceTypeDto,
        { new: true },
      );

      // Si no se encontró, lanzar una excepción
      if (!updatedServiceType) {
        throw new NotFoundException(
          `Service type with ID ${service_type_id} not found`,
        );
      }

      return updatedServiceType;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error updating service type: ${error.message}`,
      );
    }
  }
}
