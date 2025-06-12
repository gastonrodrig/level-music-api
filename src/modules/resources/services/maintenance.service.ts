import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Maintenance } from '../schema/maintenance.schema';
import { Model } from 'mongoose';
import { CreateMaintenanceDto, UpdateMaintenanceStatusDto } from '../dto';
import { SF_MAINTENANCE } from 'src/core/utils/searchable-fields';
import { Resource } from '../schema/resource.schema';
import { MaintenanceStatusType, MaintenanceType, ResourceStatusType } from '../enum';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<Maintenance>,
    @InjectModel(Resource.name)
    private resourceModel: Model<Resource>,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto): Promise<Maintenance> {
    try {
      // Validar existencia del recurso
      const resource = await this.resourceModel.findById(createMaintenanceDto.resource_id);
      if (!resource) {
        throw new NotFoundException('Recurso no encontrado');
      }

      if (createMaintenanceDto.type === MaintenanceType.CORRECTIVO) {
        if (resource.status !== ResourceStatusType.DAÑADO) {
          throw new BadRequestException('Solo se puede crear mantenimiento correctivo si el recurso está dañado');
        }

        // Validar que no existan preventivos pendientes
        const preventivoPendiente = await this.maintenanceModel.findOne({
          resource_id: resource._id,
          type: MaintenanceType.PREVENTIVO,
          status: { $in: [MaintenanceStatusType.PROGRAMADO, MaintenanceStatusType.EN_PROGRESO] }
        });

        if (preventivoPendiente) {
          throw new BadRequestException('No se puede crear un correctivo mientras exista un preventivo pendiente');
        }
      } else {
        throw new BadRequestException('Solo se pueden crear mantenimientos de tipo correctivo');
      }

      // Si pasa validaciones, creamos el mantenimiento
      const maintenance = new this.maintenanceModel(createMaintenanceDto);

      // Si es correctivo, cancelamos cualquier preventivo (por seguridad, doble validación)
      if (createMaintenanceDto.type === MaintenanceType.CORRECTIVO) {
        await this.maintenanceModel.updateMany(
          {
            resource_id: createMaintenanceDto.resource_id,
            type: MaintenanceType.PREVENTIVO,
            status: { $in: [MaintenanceStatusType.PROGRAMADO, MaintenanceStatusType.EN_PROGRESO] }
          },
          { $set: { status: MaintenanceStatusType.CANCELADO } }
        );
      }

      return await maintenance.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error creating maintenance: ${error.message}`);
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Maintenance[] }> {
    try {
      const filter = search
        ? {
            $or: SF_MAINTENANCE.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.maintenanceModel
          .find(filter)
          .populate('resource')	
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.maintenanceModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding maintenance with pagination: ${error.message}`,
      );
    }
  }

  async createInitialPreventiveMaintenance(resource: Resource): Promise<Maintenance> {
    const maintenance = await this.maintenanceModel.create({
      type: MaintenanceType.PREVENTIVO,
      status: MaintenanceStatusType.PROGRAMADO,
      resource: resource._id,
      date: resource.next_maintenance_date,
      description: 'Mantenimiento preventivo inicial generado automáticamente',
    });

    return maintenance.save();
  }

  async updateStatus(maintenanceId: string, statusDto: UpdateMaintenanceStatusDto): Promise<Maintenance> {
    const maintenance = await this.maintenanceModel.findById(maintenanceId);
    if (!maintenance) {
      throw new NotFoundException('Mantenimiento no encontrado');
    }

    if (maintenance.status === MaintenanceStatusType.FINALIZADO) {
      throw new BadRequestException('Este mantenimiento ya está finalizado');
    }

    maintenance.status = statusDto.status;
    await maintenance.save();

    // Si pasa a EN_PROGRESO → poner recurso en MANTENIMIENTO
    if (statusDto.status === MaintenanceStatusType.EN_PROGRESO) {
      await this.resourceModel.findByIdAndUpdate(
        maintenance.resource,
        { status: ResourceStatusType.MANTENIMIENTO }
      );
    }

    // Si pasa a FINALIZADO → actualizar ultima fecha de mantenimiento
    if (statusDto.status === MaintenanceStatusType.FINALIZADO) {
      await this.resourceModel.findByIdAndUpdate(
        maintenance.resource,
        { last_maintenance_date: maintenance.date }
      );

      // El recurso pasa a estado DISPONIBLE
      await this.resourceModel.findByIdAndUpdate(
        maintenance.resource,
        { status: ResourceStatusType.DISPONIBLE }
      );
    }

    return maintenance;
  }
}
