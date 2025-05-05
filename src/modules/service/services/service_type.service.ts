import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ServiceType } from '../schema/service_type.schema';
import { Model } from 'mongoose';
import { UpdateServiceTypeDto } from '../dto/update-service_type.dto';

@Injectable()
export class ServiceTypeService {
  constructor(
    @InjectModel(ServiceType.name)
    private serviceTypeModel: Model<ServiceType>,
  ) {}

  async create(createServiceTypeDto: any): Promise<ServiceType> {
    try {
      const serviceType = await this.serviceTypeModel.create(createServiceTypeDto);
      return await serviceType.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating service type: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<ServiceType[]> {
    try {
      return await this.serviceTypeModel.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding service types: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit: number,
    offset: number,
  ): Promise<{ total: number; items: ServiceType[] }> {
    try {
      const [items, total] = await Promise.all([
        this.serviceTypeModel
          .find()
          .skip(offset)
          .limit(limit)
          .exec(),
        this.serviceTypeModel.countDocuments().exec(),
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

  async remove(service_type_id: string) {
    const serviceType = await this.serviceTypeModel.findOneAndDelete({ _id: service_type_id });
    if (!serviceType) {
      throw new InternalServerErrorException('Service type not found');
    }

    return { success: true };
  }
  
}
