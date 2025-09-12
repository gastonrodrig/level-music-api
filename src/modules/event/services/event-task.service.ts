import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import { CreateEventTaskDto, UpdateEventTaskDto } from '../dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SF_EVENT_TASK } from 'src/core/utils';
import { EventTask, Event } from '../schema';
import { WorkerType } from 'src/modules/worker/schema';

@Injectable()
export class EventTaskService {
  constructor(
    @InjectModel(EventTask.name)
    private eventTaskModel: Model<EventTask>,
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
    @InjectModel(WorkerType.name)
    private workerTypeModel: Model<WorkerType>,
  ) {}

  async create(createEventTaskDto: CreateEventTaskDto): Promise<EventTask> {
    try {
      const event = await this.eventModel.findById(createEventTaskDto.event_id);
      if (!event) throw new BadRequestException('Event not found');

      const workerType = await this.workerTypeModel.findById(createEventTaskDto.worker_type_id);
      if (!workerType) throw new BadRequestException('Worker type not found');

      const eventTask = new this.eventTaskModel({
        ...createEventTaskDto,
        event: event._id,
        worker_type: workerType._id,
      });

      return await eventTask.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating event task: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
      limit = 5,
      offset = 0,
      search = '',
      sortField: string,
      sortOrder: 'asc' | 'desc' = 'asc',
    ): Promise<{ total: number; items: EventTask[] }> {
      try {
        // Notas:
        // 1) se filtra por nombre o descripción (Campos de la tabla)
        const filter = search
        ? {
            $or: SF_EVENT_TASK.map(field => ({
              [field]: { $regex: search, $options: 'i' }
            })),
          }
        : {};
  
        // 2) se ordena por el campo que se pasa por parámetro (Ascendente o Descendente)
        const sortObj: Record<string, 1 | -1> = {
          [sortField]: sortOrder === 'asc' ? 1 : -1,
        };
  
        const [items, total] = await Promise.all([
          this.eventTaskModel
            .find(filter)
            .collation({ locale: 'es', strength: 1 })
            .sort(sortObj)
            .skip(offset)
            .limit(limit)
            .exec(),
          this.eventTaskModel
            .countDocuments(filter)
            .exec(),
        ]);
  
        return { total, items };
      } catch (error) {
        throw new InternalServerErrorException(
          `Error finding event task with pagination: ${error.message}`,
        );
      }
    }

  async findOne(event_task_id: string): Promise<EventTask> {
    try {
      const eventTask = await this.eventTaskModel.findOne({
        _id: event_task_id,
      });
      if (!eventTask) {
        throw new BadRequestException('Tarea de evento no encontrado');
      }
      return eventTask;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding event task: ${error.message}`,
      );
    }
  }

  async update(event_task_id: string, updateEventTaskDto: UpdateEventTaskDto): Promise<EventTask> {
    try {
      const eventTask = await this.eventTaskModel.findOne({ _id: event_task_id });
      if (!eventTask) {
        throw new BadRequestException('Tarea de evento no encontrado');
      }
      Object.assign(eventTask, updateEventTaskDto);
      return await eventTask.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}