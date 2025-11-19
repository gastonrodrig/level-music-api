import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StorehouseMovement } from '../schema';
import { Model } from 'mongoose';
import { CreateStorehouseMovementDto } from '../dto';
import { SF_STOREHOUSE_MOVEMENT } from 'src/core/utils';
import { Event } from 'src/modules/event/schema';
import { Equipment } from 'src/modules/equipments/schema';
import { Assignation } from 'src/modules/event/schema';
import { ResourceType } from 'src/modules/event/enum/resource-type.enum';
import { LocationType } from 'src/modules/equipments/enum';

@Injectable()
export class StorehouseMovementService {
  constructor(
    @InjectModel(StorehouseMovement.name)
    private storehouseMovementModel: Model<StorehouseMovement>,
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
    @InjectModel(Equipment.name)
    private equipmentModel: Model<Equipment>,
    @InjectModel(Assignation.name)
    private assignationModel: Model<Assignation>,
  ) {}

  // Return assignations (one per equipment) for an event code when event is En Revisión
  async getAssignationsByEventCode(event_code: string) {
    try {
      const event = await this.eventModel.findOne({ event_code });
      if (!event) throw new NotFoundException('Event not found');
      // check status equals En Revisión
      const { StatusType } = require('src/modules/event/enum/status-type.enum');
      if (event.status !== StatusType.EN_REVISION) {
        throw new BadRequestException('Event is not in En Revisión');
      }

      // find assignations for event and resource type EQUIPMENT
      const assignations = await (this as any).assignationModel.find({ event: event._id, resource_type: ResourceType.EQUIPMENT }).sort({ assigned_at: -1 }).exec();

      // keep only one assignation per resource (most recent)
      const map = new Map();
      for (const a of assignations) {
        const resId = a.resource.toString();
        if (!map.has(resId)) map.set(resId, a);
      }

      return { event, assignations: Array.from(map.values()) };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(`Error getting assignations: ${error.message}`);
    }
  }

  // Create movements for each assignation (equipment) of an event
  async createFromEvent(dto: any) {
    try {
      const { code, movement_type, destination } = dto;
      const { event, assignations } = await this.getAssignationsByEventCode(code);

      const created: any[] = [];
      const errors: any[] = [];

      for (const a of assignations) {
        try {
          const equipmentId = a.resource;
          const movementCode = `MVT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
          const movement = new this.storehouseMovementModel({
            equipment: equipmentId,
            event: event._id,
            movement_type,
            destination: destination || LocationType.EVENTO,
            code: movementCode,
          });
          await movement.save();
          created.push(movement);
        } catch (err) {
          errors.push({ assignation: a._id, error: err.message });
        }
      }

      return { created: created.length, items: created, errors };
    } catch (error) {
      throw error;
    }
  }

  // Create a manual movement by equipment serial
  async createManual(dto: any) {
    try {
      const { serial_number, movement_type, event_code, destination } = dto;
      // find equipment
      const equipment = await this.equipmentModel.findOne({ serial_number });
      if (!equipment) throw new NotFoundException('Equipment not found');

      let event = null;
      if (event_code) {
        event = await this.eventModel.findOne({ event_code });
        if (!event) throw new NotFoundException('Event not found');
      } else {
        throw new BadRequestException('event_code is required for manual movements');
      }

      const movementCode = `MVT-${Date.now().toString(36)}`;
      const movement = new this.storehouseMovementModel({
        equipment: equipment._id,
        event: event._id,
        movement_type,
        destination: destination || LocationType.SALIDA,
        code: movementCode,
      });

      await movement.save();
      return movement;
    } catch (error) {
      throw error;
    }
  }

  async create(createStorehouseMovementDto: CreateStorehouseMovementDto): Promise<StorehouseMovement> {
    try {
      const event = await this.eventModel.findById(createStorehouseMovementDto.event_id);
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      const equipment = await this.equipmentModel.findById(createStorehouseMovementDto.equipment_id);
      if (!equipment) {
        throw new NotFoundException('Equipment not found');
      }

      const movementCode = createStorehouseMovementDto.code || `MVT-${Date.now().toString(36)}`;
      const movementState = (createStorehouseMovementDto as any).state || 'Activo';

      const storehouseMovement = new this.storehouseMovementModel({
        ...createStorehouseMovementDto,
        event: event._id,
        equipment: equipment._id,
        code: movementCode,
        state: movementState,
      });

      return await storehouseMovement.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating storehouse movement: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    code?: string,
    movement_type?: string,
    state?: string,
  ): Promise<{ total: number; items: StorehouseMovement[] }> {
    try {
      // Build filter from params (no free-text search)
      const filter: any = {};
      if (code) filter.code = code;
      if (movement_type) filter.movement_type = movement_type;
      if (state) filter.state = state;

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.storehouseMovementModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.storehouseMovementModel
          .countDocuments(filter)
          .exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding storehouse movement with pagination: ${error.message}`,
      );
    }
  }

  async findOne(storehouseMovementId: string): Promise<StorehouseMovement> {
    try {
      const storehouseMovement = await this.storehouseMovementModel.findOne({
        _id: storehouseMovementId,
      });

      if (!storehouseMovement) {
        throw new NotFoundException('Movimiento de almacén no encontrado');
      }

      return storehouseMovement;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding storehouse movement: ${error.message}`,
      );
    }
  }
}
