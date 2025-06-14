import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service } from '../schema';
import { Model } from 'mongoose';
import { Provider } from '../../provider/schema';
import { ServiceType } from '../schema';
import { CreateServiceDto, UpdateServiceDto } from '../dto';
import { SF_SERVICE } from 'src/core/utils';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
    @InjectModel(Provider.name)
    private providerModel: Model<Provider>,
    @InjectModel(ServiceType.name)
    private serviceTypeModel: Model<ServiceType>,
  ) {}

  // Guiarse de aqui, solo cuando la tabla tiene ref's
  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      const provider = await this.providerModel.findById(createServiceDto.provider_id);
      if (!provider) throw new BadRequestException('Provider not found');
      
      const serviceType = await this.serviceTypeModel.findById(createServiceDto.service_type_id);
      if (!serviceType) throw new BadRequestException('Service type not found');
      
      const newService = new this.serviceModel({
        ...createServiceDto,
        provider: provider._id,
        service_type: serviceType._id,
        provider_name: provider.name,
        service_type_name: serviceType.name,
      });

      return await newService.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating service: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Service[] }> {
    try {
      const filter = search
        ? {
            $or: SF_SERVICE.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.serviceModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.serviceModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding services with pagination: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<Service> {
    try {
      const service = await this.serviceModel.findById(id).exec();
      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }
      return service;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding service: ${error.message}`,
      );
    }
  }

  async update(
    service_id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    try {
      const updatedService = await this.serviceModel.findByIdAndUpdate(
        service_id,
        updateServiceDto,
        { new: true },
      );

      if (!updatedService) {
        throw new NotFoundException(`Service with ID ${service_id} not found`);
      }

      return updatedService;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating service: ${error.message}`,
      );
    }
  }
}
