import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Maintenance, Resource } from '../schema';
import { CreateMaintenanceDto, UpdateMaintenanceStatusDto } from '../dto';
import { MaintenanceStatusType, MaintenanceType, ResourceStatusType } from '../enum';
import { SF_MAINTENANCE, toObjectId } from 'src/core/utils';
import * as dayjs from 'dayjs';
import { errorCodes } from 'src/core/common';

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

      // Validar que el tipo de mantenimiento sea correctivo
      if (createMaintenanceDto.type !== MaintenanceType.CORRECTIVO) { 
        throw new BadRequestException('Solo se pueden crear mantenimientos de tipo correctivo');
      }

      // Validar que no esté ya en mantenimiento
      if (resource.status === ResourceStatusType.MANTENIMIENTO) {
        throw new HttpException(
          { code: errorCodes.RESOURCE_UNDER_MAINTENANCE, message: 'El recurso ya se encuentra en mantenimiento.' },
          HttpStatus.BAD_REQUEST
        );
      }

      // Validar que esté dañado
      if (resource.status !== ResourceStatusType.DAÑADO) {
        throw new HttpException(
          { code: errorCodes.RESOURCE_NOT_DAMAGED, message: 'El recurso debe encontrarse dañado.' },
          HttpStatus.BAD_REQUEST
        );
      }

      // Se crea el mantenimiento
      const maintenance = new this.maintenanceModel({
        ...createMaintenanceDto,
        resource: resource._id,
        resource_serial_number: resource.serial_number,
        resource_name: resource.name,
        resource_type: resource.resource_type,
      });
      
      const saved = await maintenance.save();

      // Actualizamos el recurso
      const updatedResource = await this.resourceModel.findByIdAndUpdate(
        createMaintenanceDto.resource_id,
        {
          status: ResourceStatusType.MANTENIMIENTO,
          $inc: { maintenance_count: 1 },
        },
        { new: true }
      );

      // Buscamos preventivos pendientes (solo deberia dar 1 en realidad, SIEMPRE)
      const pendingPreventives = await this.maintenanceModel.find({
        resource: toObjectId(createMaintenanceDto.resource_id),
        type: MaintenanceType.PREVENTIVO,
        status: {
          $in: [
            MaintenanceStatusType.PROGRAMADO,
            MaintenanceStatusType.EN_PROGRESO,
          ],
        },
      });

      // re-agendamos su fecha a partir del correctivo
      const interval = updatedResource.maintenance_interval_days;
      for (const prev of pendingPreventives) {
        const newDate = dayjs(saved.date).add(interval, "day").toDate();

        await this.maintenanceModel.findByIdAndUpdate(prev._id, {
          date: newDate,
          status: MaintenanceStatusType.PROGRAMADO, 
        });
      }

      // Actualizamos la fecha del próximo mantenimiento del recurso
      const nextDate = dayjs(saved.date).add(interval, "day").toDate();
      await this.resourceModel.findByIdAndUpdate(
        createMaintenanceDto.resource_id,
        { next_maintenance_date: nextDate }
      );

      return saved;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Error creating the maintenance: ${error.message}`);
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
      resource_serial_number: resource.serial_number,
      resource_name: resource.name,
      resource_type: resource.resource_type,
      date: resource.next_maintenance_date,
      description: 'Mantenimiento preventivo inicial generado automáticamente',
    });

    return maintenance.save();
  }

  async updateStatus(maintenanceId: string, updateMaintenanceStatusDto: UpdateMaintenanceStatusDto): Promise<Maintenance> {
    try {
      const maintenance = await this.maintenanceModel.findById(maintenanceId);
      if (!maintenance) {
        throw new NotFoundException('Mantenimiento no encontrado');
      }

      // Validar que el mantenimiento no esté ya finalizado
      if (maintenance.status === MaintenanceStatusType.FINALIZADO) {
        throw new HttpException(
          { code: errorCodes.RESOURCE_ALREADY_FINISHED_MAINTENANCE, message: 'El mantenimiento ya se encuentra finalizado.' },
          HttpStatus.BAD_REQUEST
        );
      }

      // Se verifican que no hayan otros mantenimientos sin finalizar
      if (updateMaintenanceStatusDto.status === MaintenanceStatusType.EN_PROGRESO) {
        const pendiente = await this.maintenanceModel.findOne({
          resource: maintenance.resource,
          status: { $ne: MaintenanceStatusType.FINALIZADO },
          date: { $lt: maintenance.date },
        });

        if (pendiente) {
          throw new HttpException(
            { code: errorCodes.PREVIOUS_MAINTENANCE_NOT_FINALIZED, message: 'Debe finalizar primero los mantenimientos anteriores de este recurso.' },
            HttpStatus.BAD_REQUEST
          );
        }

        // Cambiamos el estado del recurso a mantenimiento
        await this.resourceModel.findByIdAndUpdate(
          maintenance.resource,
          { status: ResourceStatusType.MANTENIMIENTO }
        );
      }

      

      // Si pasa a estado reagendado, se requiere un motivo de reagendacion y se reprograma
      if (updateMaintenanceStatusDto.status === MaintenanceStatusType.REAGENDADO) {
        maintenance.reagendation_reason = updateMaintenanceStatusDto.reagendation_reason;
        maintenance.return_to_available = updateMaintenanceStatusDto.return_to_available;
        
        // Para mantenimientos correctivos, verificar el valor del booleano
        if (maintenance.type === MaintenanceType.CORRECTIVO) {
          const newStatus = updateMaintenanceStatusDto.return_to_available 
            ? ResourceStatusType.DISPONIBLE 
            : ResourceStatusType.DAÑADO;
            
          await this.resourceModel.findByIdAndUpdate(
            maintenance.resource,
            { status: newStatus }
          );

          // Si la reagendacion es real (recurso queda dañado), se requiere fecha de reagendamiento
          if (!updateMaintenanceStatusDto.return_to_available && updateMaintenanceStatusDto.rescheduled_date) {
            const rescheduledDate = new Date(updateMaintenanceStatusDto.rescheduled_date);
            // Actualizar la fecha del mantenimiento
            maintenance.date = rescheduledDate;
          }
        } else {
          // Para mantenimientos preventivos, siempre regresa a disponible
          await this.resourceModel.findByIdAndUpdate(
            maintenance.resource,
            { status: ResourceStatusType.DISPONIBLE }
          );
        }

        // Establecer el estado como REAGENDADO
        maintenance.status = MaintenanceStatusType.REAGENDADO;
      } else {
        // Para otros estados que no sean REAGENDADO
        maintenance.status = updateMaintenanceStatusDto.status;
      }

      await maintenance.save();

      // Si pasa a estado finalizado, se actualiza a la ultima fecha que se hizo mantenimiento
      if (updateMaintenanceStatusDto.status === MaintenanceStatusType.FINALIZADO) {
        await this.resourceModel.findByIdAndUpdate(
          maintenance.resource,
          {
            last_maintenance_date: maintenance.date, // actualizamos la fecha
            status: ResourceStatusType.DISPONIBLE, // pasa a Disponible
            $inc: { maintenance_count: 1 }, // incrementamos el contador de mantenimientos
          }
        );
      }

      return maintenance;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Error updating maintenance status: ${error.message}`);
    }
  }
}
