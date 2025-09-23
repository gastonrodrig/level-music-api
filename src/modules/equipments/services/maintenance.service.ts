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
import { Maintenance, Equipment } from '../schema';
import { CreateMaintenanceDto, UpdateMaintenanceStatusDto } from '../dto';
import {
  MaintenanceStatusType,
  MaintenanceType,
  EquipmentStatusType,
} from '../enum';
import { SF_MAINTENANCE, toObjectId, getCurrentDateNormalized } from 'src/core/utils';
import * as dayjs from 'dayjs';
import { errorCodes } from 'src/core/common';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<Maintenance>,
    @InjectModel(Equipment.name)
    private equipmentModel: Model<Equipment>,
  ) {}

  async create(
    createMaintenanceDto: CreateMaintenanceDto,
  ): Promise<Maintenance> {
    try {
      // Validar existencia del equipo
      const equipment = await this.equipmentModel.findById(
        createMaintenanceDto.equipment_id,
      );
      if (!equipment) {
        throw new NotFoundException('Equipo no encontrado');
      }

      // Validar que el tipo de mantenimiento sea correctivo
      if (createMaintenanceDto.type !== MaintenanceType.CORRECTIVO) {
        throw new BadRequestException(
          'Solo se pueden crear mantenimientos de tipo correctivo',
        );
      }

      // Validar que no esté ya en mantenimiento
      if (equipment.status === EquipmentStatusType.MANTENIMIENTO) {
        throw new HttpException(
          {
            code: errorCodes.EQUIPMENT_UNDER_MAINTENANCE,
            message: 'El equipo ya se encuentra en mantenimiento.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validar que esté dañado
      if (equipment.status !== EquipmentStatusType.DAÑADO) {
        throw new HttpException(
          {
            code: errorCodes.EQUIPMENT_NOT_DAMAGED,
            message: 'El equipo debe encontrarse dañado.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Se crea el mantenimiento
      const maintenance = new this.maintenanceModel({
        ...createMaintenanceDto,
        equipment: equipment._id,
        equipment_serial_number: equipment.serial_number,
        equipment_name: equipment.name,
        equipment_type: equipment.equipment_type,
      });

      const saved = await maintenance.save();

      // Actualizamos el equipo
      const updatedEquipment = await this.equipmentModel.findByIdAndUpdate(
        createMaintenanceDto.equipment_id,
        {
          status: EquipmentStatusType.MANTENIMIENTO,
          $inc: { maintenance_count: 1 },
        },
        { new: true },
      );

      // Buscamos preventivos pendientes (solo deberia dar 1 en realidad, SIEMPRE)
      const pendingPreventives = await this.maintenanceModel.find({
        equipment: toObjectId(createMaintenanceDto.equipment_id),
        type: MaintenanceType.PREVENTIVO,
        status: {
          $in: [
            MaintenanceStatusType.PROGRAMADO,
            MaintenanceStatusType.EN_PROGRESO,
          ],
        },
      });

      // re-agendamos su fecha a partir del correctivo
      const interval = updatedEquipment.maintenance_interval_days;
      for (const prev of pendingPreventives) {
        const newDate = dayjs(saved.date).add(interval, 'day').toDate();

        await this.maintenanceModel.findByIdAndUpdate(prev._id, {
          date: newDate,
          status: MaintenanceStatusType.PROGRAMADO,
        });
      }

      // Actualizamos la fecha del próximo mantenimiento del equipo
      const nextDate = dayjs(saved.date).add(interval, 'day').toDate();
      await this.equipmentModel.findByIdAndUpdate(
        createMaintenanceDto.equipment_id,
        { next_maintenance_date: nextDate },
      );

      return saved;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error creating the maintenance: ${error.message}`,
      );
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

  async createInitialPreventiveMaintenance(
    equipment: Equipment,
  ): Promise<Maintenance> {
    const maintenance = await this.maintenanceModel.create({
      type: MaintenanceType.PREVENTIVO,
      status: MaintenanceStatusType.PROGRAMADO,
      equipment: equipment._id,
      equipment_serial_number: equipment.serial_number,
      equipment_name: equipment.name,
      equipment_type: equipment.equipment_type,
      date: equipment.next_maintenance_date,
      description: 'Mantenimiento preventivo inicial generado automáticamente',
    });

    return maintenance.save();
  }

  async updateStatus(
    maintenanceId: string,
    updateMaintenanceStatusDto: UpdateMaintenanceStatusDto,
  ): Promise<Maintenance> {
    try {
      const maintenance = await this.maintenanceModel.findById(maintenanceId);
      if (!maintenance) {
        throw new NotFoundException('Mantenimiento no encontrado');
      }

      // Validar que el mantenimiento no esté ya finalizado
      if (maintenance.status === MaintenanceStatusType.FINALIZADO) {
        throw new HttpException(
          {
            code: errorCodes.EQUIPMENT_ALREADY_FINISHED_MAINTENANCE,
            message: 'El mantenimiento ya se encuentra finalizado.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validar que no se pueda reagendar, cancelar o iniciar un mantenimiento preventivo si hay correctivos sin finalizar
      if (
        (updateMaintenanceStatusDto.status ===
          MaintenanceStatusType.REAGENDADO ||
          updateMaintenanceStatusDto.status ===
            MaintenanceStatusType.CANCELADO ||
          updateMaintenanceStatusDto.status ===
            MaintenanceStatusType.EN_PROGRESO) &&
        maintenance.type === MaintenanceType.PREVENTIVO
      ) {
        const correctivoSinFinalizar = await this.maintenanceModel.findOne({
          equipment: maintenance.equipment,
          type: MaintenanceType.CORRECTIVO,
          status: { 
            $nin: [MaintenanceStatusType.FINALIZADO, MaintenanceStatusType.CANCELADO] 
          },
        });

        if (correctivoSinFinalizar) {
          let action = 'iniciar';
          if (
            updateMaintenanceStatusDto.status ===
            MaintenanceStatusType.REAGENDADO
          )
            action = 'reagendar';
          if (
            updateMaintenanceStatusDto.status ===
            MaintenanceStatusType.CANCELADO
          )
            action = 'cancelar';

          throw new HttpException(
            {
              code: errorCodes.CORRECTIVE_MAINTENANCE_NOT_FINALIZED,
              message: `No se puede ${action} un mantenimiento preventivo mientras haya mantenimientos correctivos sin finalizar.`,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Se verifican que no hayan otros mantenimientos sin finalizar
      if (
        updateMaintenanceStatusDto.status === MaintenanceStatusType.EN_PROGRESO
      ) {
        if (maintenance.date.toISOString() !== getCurrentDateNormalized()) {
          throw new HttpException(
            {
              code: errorCodes.MAINTENANCE_DATE_NOT_TODAY,
              message: `Para iniciar un mantenimiento, la fecha debe ser hoy.`,
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        // Cambiamos el estado del equipo a mantenimiento
        await this.equipmentModel.findByIdAndUpdate(maintenance.equipment, {
          status: EquipmentStatusType.MANTENIMIENTO,
        });
      }

      // Si pasa a estado reagendado, se requiere un motivo de reagendacion y se reprograma
      if (
        updateMaintenanceStatusDto.status === MaintenanceStatusType.REAGENDADO
      ) {
        maintenance.reagendation_reason =
          updateMaintenanceStatusDto.reagendation_reason;

        // Si se proporciona una nueva fecha, actualizarla
        if (updateMaintenanceStatusDto.rescheduled_date) {
          const rescheduledDate = new Date(
            updateMaintenanceStatusDto.rescheduled_date,
          );
          maintenance.date = rescheduledDate;

          // Si es un mantenimiento preventivo, actualizar la next_maintenance_date del equipo
          if (maintenance.type === MaintenanceType.PREVENTIVO) {
            await this.equipmentModel.findByIdAndUpdate(maintenance.equipment, {
              next_maintenance_date: rescheduledDate,
            });
          }
        }

        // El equipo regresa a Dañado cuando se reagenda
        await this.equipmentModel.findByIdAndUpdate(maintenance.equipment, {
          status:
            maintenance.type === MaintenanceType.CORRECTIVO
              ? EquipmentStatusType.DAÑADO
              : EquipmentStatusType.DISPONIBLE,
        });

        // Establecer el estado como REAGENDADO
        maintenance.status = MaintenanceStatusType.REAGENDADO;
      } else if (
        updateMaintenanceStatusDto.status === MaintenanceStatusType.CANCELADO
      ) {
        // Si pasa a estado cancelado, se requiere un motivo de cancelación
        maintenance.cancelation_reason =
          updateMaintenanceStatusDto.cancelation_reason;

        // El equipo regresa a disponible cuando se cancela
        await this.equipmentModel.findByIdAndUpdate(maintenance.equipment, {
          status: EquipmentStatusType.DISPONIBLE,
        });

        // Establecer el estado como CANCELADO
        maintenance.status = MaintenanceStatusType.CANCELADO;
      } else {
        // Para otros estados que no sean REAGENDADO ni CANCELADO
        maintenance.status = updateMaintenanceStatusDto.status;
      }

      await maintenance.save();

      // Si pasa a estado finalizado, se actualiza a la ultima fecha que se hizo mantenimiento
      if (
        updateMaintenanceStatusDto.status === MaintenanceStatusType.FINALIZADO
      ) {
        const updateData: any = {
          status: EquipmentStatusType.DISPONIBLE, // pasa a Disponible
          $inc: { maintenance_count: 1 }, // incrementamos el contador de mantenimientos
        };

        // Para mantenimientos preventivos, actualizar la fecha con maintenance.date
        // Para correctivos, mantener la fecha como estaba (no actualizar last_maintenance_date)
        if (maintenance.type === MaintenanceType.PREVENTIVO) {
          updateData.last_maintenance_date = maintenance.date;
        }

        await this.equipmentModel.findByIdAndUpdate(maintenance.equipment, updateData);
      }

      return maintenance;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error updating maintenance status: ${error.message}`,
      );
    }
  }
}
