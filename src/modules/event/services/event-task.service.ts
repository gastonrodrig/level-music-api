import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import { CreateEventTaskDto, UpdateEventTaskDto } from '../dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
import { SF_EVENT_TASK } from 'src/core/utils';
import { EventTask, Event, EventType } from '../schema';
import { WorkerType,Worker } from 'src/modules/worker/schema';

@Injectable()
export class EventTaskService {
  constructor(
    @InjectModel(EventTask.name)
    private eventTaskModel: Model<EventTask>,
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
    @InjectModel(EventType.name)
    private eventTypeModel: Model<EventType>,
    @InjectModel(WorkerType.name)
    private workerTypeModel: Model<WorkerType>,
    @InjectModel(Worker.name)
    private workerModel: Model<Worker>,

  ) {}

  async findByStatus( status?: string): Promise<EventTask[]> {
    try {
      const query = status ? { status } : {};
      return await this.eventTaskModel.find(query).lean().exec();
    } catch (error) {
      throw new InternalServerErrorException(`Error finding tasks for event ${status}: ${error.message}`);
    }
  }

  async findByEventId(eventId?: string): Promise<EventTask[]> {
    try {
      const objectId = new Types.ObjectId(eventId);
      const query = eventId ? { event: objectId } : {};
      if (!eventId) {
        throw new BadRequestException('Event ID is required');
      }
      const tasks = await this.eventTaskModel.find(query).lean().exec();
      return tasks;

    } catch (error) {
      throw new InternalServerErrorException(`Error finding tasks for event ${eventId}: ${error.message}`);
    }
  }

  async create(createEventTaskDto: CreateEventTaskDto): Promise<EventTask> {
    try {
      const event = await this.eventModel.findById(createEventTaskDto.event_id);
      if (!event) throw new BadRequestException('Event not found');

      let workerTypeName: string ;
      const workerType = await this.workerTypeModel.findById(createEventTaskDto.worker_type_id);
      if (!workerType) throw new BadRequestException('Worker type not found');
      workerTypeName = workerType.name;

      let workerName: string ;
      const worker = await this.workerModel.findById(createEventTaskDto.worker_id);
      workerName = `${(worker.first_name )} ${(worker.last_name)}`.trim();
      if (!worker) throw new BadRequestException('Worker not found');

      const eventType = await this.eventTypeModel.findById(createEventTaskDto.event_type_id);
      if (!eventType) throw new BadRequestException('Event type not found');
      

      const eventTask = new this.eventTaskModel({
        ...createEventTaskDto,
        event: event._id,
        worker_type: workerType._id,
        worker: worker._id,
        worker_name: workerName,
        worker_type_name: workerTypeName,
        event_type: eventType._id,
        
      });
      console.log('Creating event task:', eventTask);
      return await eventTask.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating event task: ${error.message}`,
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