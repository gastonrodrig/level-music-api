import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Maintenance, Resource } from '../schema';
import { CreateResourceDto, UpdateResourceDto, UpdateResourceStatusDto } from '../dto';
import { MaintenanceService } from './';
import { SF_RESOURCE, getCurrentDate, toObjectId } from 'src/core/utils';
import { MaintenanceStatusType, MaintenanceType } from '../enum';
import * as dayjs from 'dayjs';
import { errorCodes } from 'src/core/common';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource.name)
    private resourceModel: Model<Resource>,
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<Maintenance>,
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
    try {
      const resource = await this.resourceModel.findOne({ serial_number: serial });
      if (!resource) {
        throw new HttpException(
          { code: errorCodes.RESOURCE_NOT_FOUND, message: 'Recurso no encontrado.' },
          HttpStatus.BAD_REQUEST
        );
      }
      return resource;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Error finding the resource by serial #: ${error.message}`);
    }
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
      // Valida que el recurso exista
      const resource = await this.resourceModel.findById(resource_id);
      if (!resource) {
        throw new NotFoundException(`Resource with ID ${resource_id} not found`);
      }

      // Si viene con valor null, lo dejo como null
      if (updateResourceDto.last_maintenance_date === null) {
        resource.last_maintenance_date = null;
      } else if (updateResourceDto.last_maintenance_date != null) {
        // si viene con valor, lo actualizo
        resource.last_maintenance_date = new Date(updateResourceDto.last_maintenance_date);
      }

      // Si cambió el intervalo, recalcula next_maintenance_date
      const newInterval = updateResourceDto.maintenance_interval_days;
      const baseDate = resource.last_maintenance_date ?? getCurrentDate();
      const nextDate = dayjs(baseDate).add(newInterval, "day").toDate();

      // Reprograma el preventivo en estado PROGRAMADO
      await this.maintenanceModel.updateMany(
        { 
          resource: toObjectId(resource_id),
          type: MaintenanceType.PREVENTIVO,
          status: MaintenanceStatusType.PROGRAMADO
        },
        { $set: { date: nextDate } }
      );

      // Ajusta el campo en el recurso
      resource.next_maintenance_date = nextDate;
      resource.maintenance_interval_days = newInterval;

      resource.name = updateResourceDto.name;
      resource.description = updateResourceDto.description;
      resource.resource_type = updateResourceDto.resource_type;

      return await resource.save();
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
