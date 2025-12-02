import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorehouseMovement } from '../schema';
import { Event, EventTask, EventSubtask, Assignation } from 'src/modules/event/schema';
import { Equipment } from 'src/modules/equipments/schema';
import { CreateStorehouseMovementDto } from '../dto';
import { CreateManualMovementDto } from '../dto';
import { CreateFromStorehouseDto } from '../dto/';
import { ResourceType } from 'src/modules/event/enum/resource-type.enum';
import { LocationType } from 'src/modules/equipments/enum';
import { toObjectId } from 'src/core/utils';

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
    @InjectModel(EventTask.name)
    private eventTaskModel: Model<EventTask>,
    @InjectModel(EventSubtask.name)
    private eventSubtaskModel: Model<EventSubtask>,
  ) {}

  async create(dto: CreateStorehouseMovementDto): Promise<StorehouseMovement> {
    const { equipment_id, event_id, movement_type, destination, movement_date, code, status } = dto;

    const equipment = await this.equipmentModel.findById(equipment_id);
    if (!equipment) throw new NotFoundException('Equipo no encontrado');

    const event = await this.eventModel.findById(event_id);
    if (!event) throw new NotFoundException('Evento no encontrado');

    const movement = new this.storehouseMovementModel({
      equipment: equipment._id,
      event: event._id,
      movement_type,
      destination,
      movement_date,
      code,
      status,
    });

    await movement.save();
    return movement;
  }

  async createFromStorehouse(dto: CreateFromStorehouseDto) {
    const { code, movement_type, destination } = dto;
    const { event, assignations } = await this.getAssignationsByStorehouseCode(code);

    const created = [];

    for (const a of assignations) {
      const movement = new this.storehouseMovementModel({
        equipment: a.resource,
        event: event._id,
        event_name: event.name,
        movement_type,
        destination: destination,
        code: `MVT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      });

      await movement.save();
      created.push(movement);
    }

    return {
      created: created.length,
      items: created,
    };
  }

  async createManual(dto: CreateManualMovementDto) {
    const { equipment_id, movement_type, event_code, destination } = dto;

    const equipment = await this.equipmentModel.findOne({ _id: toObjectId(equipment_id) });
    if (!equipment) throw new NotFoundException('Equipo no encontrado');

    const event = await this.eventModel.findOne({ event_code, is_latest: true });
    if (!event) throw new NotFoundException('No existe la última versión del evento');

    const movement = new this.storehouseMovementModel({
      equipment: equipment._id,
      event: event._id,
      event_name: event.name,
      movement_type,
      destination: destination,
      code: `MVT-${Date.now().toString(36)}`,
    });

    await movement.save();
    return movement;
  }

  async findAllPaginated(
    limit: number,
    offset: number,
    search?: string,
    sortField: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'asc',
    code?: string,
    movement_type?: string,
    state?: string,
  ) {
    const filter: any = {};

    if (search) filter.$text = { $search: search };
    if (code) filter.code = code;
    if (movement_type) filter.movement_type = movement_type;
    if (state) filter.state = state;

    const total = await this.storehouseMovementModel.countDocuments(filter);
    const items = await this.storehouseMovementModel
      .find(filter)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .populate('equipment')
      .populate('event');

    return { total, items };
  }

  async getAssignationsByStorehouseCode(storehouse_code: string) {
    const subtask = await this.eventSubtaskModel
      .findOne({ storehouse_code })
      .select('parent_task');
    if (!subtask) throw new NotFoundException('No existe subtask con ese storehouse_code');

    const parentTask = await this.eventTaskModel
      .findById(subtask.parent_task)
      .select('event');
    if (!parentTask) throw new NotFoundException('No existe parentTask para este storehouse_code');

    const baseEvent = await this.eventModel
      .findById(parentTask.event);
    if (!baseEvent) throw new NotFoundException('Evento no encontrado');

    // Obtener versión más reciente
    const event = await this.eventModel.findOne({
      event_code: baseEvent.event_code,
      is_latest: true,
    });
    if (!event) throw new NotFoundException('No existe la versión más reciente del evento');

    const assignations = await this.assignationModel
      .find({ event: event._id, resource_type: ResourceType.EQUIPMENT })
      .sort({ assigned_at: -1 });

    const map = new Map();
    for (const a of assignations) {
      const equipment = a.resource.toString();
      if (!map.has(equipment)) map.set(equipment, a);
    }

    return {
      event,
      assignations: [...map.values()],
    };
  }
}
