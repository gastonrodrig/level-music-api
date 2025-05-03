import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service } from '../schema/service.schema';
import { Model } from 'mongoose';
import { CreateServiceDto} from '../dto/create-service.dto'; 
import { UpdateServiceDto } from '../dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
  ) {}

  async findAllPaginated(
    limit: number,
    offset: number,
  ): Promise<{ total: number; items: Service[] }> {
    try {
      const [items, total] = await Promise.all([
        this.serviceModel
          .find()
          .skip(offset)
          .limit(limit)
          .exec(),
        this.serviceModel.countDocuments().exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding services with pagination: ${error.message}`,
      );
    }
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      const newService = new this.serviceModel(createServiceDto);
      return await newService.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error creating service: ${error.message}`);
    }
  }

  async findAll(): Promise<Service[]> {
    try {
      return await this.serviceModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException(`Error finding all services: ${error.message}`);
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
      throw new InternalServerErrorException(`Error finding service: ${error.message}`);
    }
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    try {
      const updatedService = await this.serviceModel
        .findByIdAndUpdate(id, updateServiceDto, { new: true })
        .exec();
      if (!updatedService) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }
      return updatedService;
    } catch (error) {
      throw new InternalServerErrorException(`Error updating service: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.serviceModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }
    } catch (error) {
      throw new InternalServerErrorException(`Error removing service: ${error.message}`);
    }
  }
}
