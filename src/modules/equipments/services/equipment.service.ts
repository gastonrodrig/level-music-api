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
import { Maintenance, Equipment, EquipmentAvailability } from '../schema';
import {
  CreateEquipmentDto,
  UpdateEquipmentDto,
  CreateEquipmentPriceDto,
} from '../dto';
import { MaintenanceService } from '.';
import { SF_EQUIPMENT, getCurrentDate, toObjectId } from 'src/core/utils';
import {
  EquipmentStatusType,
  MaintenanceStatusType,
  MaintenanceType,
} from '../enum';
import { errorCodes } from 'src/core/common';
import * as dayjs from 'dayjs';
import { EquipmentPrice } from '../schema/';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectModel(Equipment.name)
    private equipmentModel: Model<Equipment>,
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<Maintenance>,
    private maintenanceService: MaintenanceService,
    @InjectModel(EquipmentAvailability.name)
    private equipmentAvailabilityModel: Model<EquipmentAvailability>,
    @InjectModel(EquipmentPrice.name)
    private equipmentPriceModel: Model<EquipmentPrice>,
  ) {}

  async validateEquipmentAvailability(
    equipment_id: string,
    date: Date,
  ): Promise<void> {
    const adjustedDate = dayjs(date).subtract(5, 'hour').toISOString();
    const dayOnly = adjustedDate.split('T')[0];
    const startOfDay = new Date(`${dayOnly}T00:00:00.000Z`);

    const conflict = await this.equipmentAvailabilityModel.findOne({
      equipment: toObjectId(equipment_id),
      date: startOfDay,
    });

    if (conflict) {
      throw new HttpException(
        {
          code: errorCodes.RESOURCE_ALREADY_ASSIGNED,
          message: 'El Equipo ya está ocupado en ese rango de horario.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    try {
      // Validar que el nombre del equipo no exista
      const existing = await this.equipmentModel.findOne({
        name: createEquipmentDto.name,
      });

      if (existing) {
        throw new HttpException(
          {
            code: errorCodes.EQUIPMENT_ALREADY_EXISTS,
            message: `El equipo "${createEquipmentDto.name}" ya existe.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generar serial_number automáticamente
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let serial = '';
      for (let i = 0; i < 12; i++) {
        serial += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const equipment = await this.equipmentModel.create({
        ...createEquipmentDto,
        serial_number: serial,
      });
      const savedEquipment = await equipment.save();

      // Crear mantenimiento preventivo inicial
      const preventiveMaintenance =
        await this.maintenanceService.createInitialPreventiveMaintenance(
          savedEquipment,
        );

      await this.equipmentAvailabilityModel.create({
        equipment: savedEquipment._id,
        date: preventiveMaintenance.date,
      });

      return savedEquipment;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error creating equipment: ${error.message}`,
      );
    }
  }

  async findAllAvailable(): Promise<Equipment[]> {
    try {
      const equipments = await this.equipmentModel
        .find({ status: EquipmentStatusType.DISPONIBLE })
        .exec();

      return equipments;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding all active equipments: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Equipment[] }> {
    try {
      const filter = search
        ? {
            $or: SF_EQUIPMENT.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.equipmentModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.equipmentModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding equipment with pagination: ${error.message}`,
      );
    }
  }

  async findBySerial(serial: string): Promise<Equipment> {
    try {
      const equipment = await this.equipmentModel.findOne({
        serial_number: serial,
      });
      if (!equipment) {
        throw new HttpException(
          {
            code: errorCodes.EQUIPMENT_NOT_FOUND,
            message: 'Equipo no encontrado.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return equipment;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error finding the equipment by serial #: ${error.message}`,
      );
    }
  }

  async findOne(equipment_id: string): Promise<Equipment> {
    try {
      const equipment = await this.equipmentModel.findOne({
        _id: equipment_id,
      });
      if (!equipment) {
        throw new NotFoundException(
          `Equipment with ID '${equipment_id}' not found`,
        );
      }

      return equipment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error finding equipment: ${error.message}`,
      );
    }
  }

  async update(equipment_id: string, updateEquipmentDto: UpdateEquipmentDto) {
    try {
      // Valida que el equipo exista
      const equipment = await this.equipmentModel.findById(equipment_id);
      if (!equipment) {
        throw new NotFoundException(
          `Equipment with ID ${equipment_id} not found`,
        );
      }

      // Validar que el equipo no tenga el mismo nombre en otro registro
      const existingName = await this.equipmentModel.findOne({
        name: updateEquipmentDto.name,
        _id: { $ne: equipment_id },
      });

      if (existingName) {
        throw new HttpException(
          {
            code: errorCodes.EQUIPMENT_ALREADY_EXISTS,
            message: `El equipo "${updateEquipmentDto.name}" ya existe.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Si viene con valor null, lo dejo como null
      if (updateEquipmentDto.last_maintenance_date === null) {
        equipment.last_maintenance_date = null;
      } else if (updateEquipmentDto.last_maintenance_date != null) {
        // si viene con valor, lo actualizo
        equipment.last_maintenance_date = new Date(
          updateEquipmentDto.last_maintenance_date,
        );
      }

      // Si cambió el intervalo, recalcula next_maintenance_date
      const newInterval = updateEquipmentDto.maintenance_interval_days;
      const baseDate = equipment.last_maintenance_date ?? getCurrentDate();
      const nextDate = dayjs(baseDate).add(newInterval, 'day').toDate();

      // Reprograma el preventivo en estado PROGRAMADO
      await this.maintenanceModel.updateMany(
        {
          equipment: toObjectId(equipment_id),
          type: MaintenanceType.PREVENTIVO,
          status: MaintenanceStatusType.PROGRAMADO,
        },
        { $set: { date: nextDate } },
      );

      // Ajusta el campo en el equipo
      equipment.next_maintenance_date = nextDate;
      equipment.maintenance_interval_days = newInterval;

      equipment.name = updateEquipmentDto.name;
      equipment.description = updateEquipmentDto.description;
      equipment.equipment_type = updateEquipmentDto.equipment_type;

      return await equipment.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error updating equipment: ${error.message}`,
      );
    }
  }
}
