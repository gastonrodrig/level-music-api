import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource } from '../schema';
import { CreateResourceDto, UpdateResourceDto, UpdateResourceStatusDto } from '../dto';
import { MaintenanceService } from './';
import { SF_RESOURCE } from 'src/core/utils';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource.name)
    private resourceModel: Model<Resource>,
    private maintenanceService: MaintenanceService,
  ) {}

  async create(createResourceDto: CreateResourceDto): Promise<Resource> {
    try {
      // Generar serial_number automáticamente
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let serial = '';
      for (let i = 0; i < 12; i++) {
        serial += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const resource = await this.resourceModel.create({
        ...createResourceDto,
        serial_number: serial,
      }); 
      const savedResource = await resource.save();

      // Crear mantenimiento preventivo inicial
      await this.maintenanceService.createInitialPreventiveMaintenance(savedResource);

      return savedResource;
    } catch (error) {
      throw new InternalServerErrorException(`Error creating resource: ${error.message}`);
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Resource[] }> {
    try {
      const filter = search
      ? {
          $or: SF_RESOURCE.map(field => ({
            [field]: { $regex: search, $options: 'i' }
          })),
        }
      : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.resourceModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.resourceModel
          .countDocuments(filter)
          .exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding resource with pagination: ${error.message}`,
      );
    }
  }

  async findBySerial(serial: string): Promise<Resource> {
    const resource = await this.resourceModel.findOne({ serial_number: serial });
    if (!resource) {
      throw new NotFoundException('Equipo no encontrado');
    }
    return resource;
  }

  async findOne(resource_id: string): Promise<Resource> {
    try {
      const resource = await this.resourceModel.findOne({ _id: resource_id });
      if (!resource) {
        throw new BadRequestException('Recurso no encontrado');
      }

      return resource;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error finding resource: ${error.message}`);
    }
  }

  async update(resource_id: string, updateResourceDto: UpdateResourceDto) {
    try {
      const updatedResource = await this.resourceModel.findOneAndUpdate(
        { _id: resource_id },
        updateResourceDto,
        { new: true }
      );

      if (!updatedResource) {
        throw new NotFoundException(`Resource with ID ${resource_id} not found`);
      }

      return updatedResource;
    } catch (error) {
      throw new InternalServerErrorException(`Error updating resource: ${error.message}`);
    }
  }

  async updateStatus(resource_id: string, statusDto: UpdateResourceStatusDto): Promise<Resource> {
    const resource = await this.resourceModel.findOne({ _id: resource_id });

    if (!resource) {
      throw new BadRequestException('Recurso no encontrado');
    }

    resource.status = statusDto.status;
    return await resource.save();
  }
}
