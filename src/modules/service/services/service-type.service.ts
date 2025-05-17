import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ServiceType } from '../schema/service-type.schema';
import { Model } from 'mongoose';
import { CreateServiceTypeDto, UpdateServiceTypeDto } from '../dto';
import { SF_SERVICE_TYPE } from 'src/core/utils/searchable-fields';

@Injectable()
export class ServiceTypeService {
  constructor(
    @InjectModel(ServiceType.name)
    private serviceTypeModel: Model<ServiceType>,
  ) {}

  async create(createServiceTypeDto: CreateServiceTypeDto): Promise<ServiceType> {
    try {
      const serviceType = await this.serviceTypeModel.create(createServiceTypeDto);
      return await serviceType.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating service type: ${error.message}`,
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
          $or: SF_SERVICE_TYPE.map(field => ({
            [field]: { $regex: search, $options: 'i' }
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
        this.serviceTypeModel
          .countDocuments(filter)
          .exec(),
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
      const serviceType = await this.serviceTypeModel.findOne({ _id: service_type_id });
      if (!serviceType) {
        throw new InternalServerErrorException('Service type not found');
      }

      return serviceType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding service type: ${error.message}`,
      );
    }
  }

  async update(id: string, updateServiceTypeDto: UpdateServiceTypeDto): Promise<ServiceType> {
    try {
      const updatedServiceType = await this.serviceTypeModel
        .findByIdAndUpdate(id, updateServiceTypeDto, { new: true })
        .exec();
      if (!updatedServiceType) {
        throw new NotFoundException(`Service type with ID ${id} not found`);
      }
      return updatedServiceType;
    } catch (error) {
      throw new InternalServerErrorException(`Error updating service type: ${error.message}`);
    }
  }
}
