import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import { CreateEventTaskDto, UpdateEventTaskDto } from '../dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
import { EventTask, Event, EventType, EventSubtask } from '../schema';
import { TaskEvidenceService } from './event-task-evidence.service';
import { TaskStatusType } from '../enum';
import { Worker, WorkerType } from 'src/modules/worker/schema';
import { CreateMultipleTasksDto } from '../dto/create-multiple-tasks.dto';
import { UpdateMultipleTasksDto } from '../dto/update-multiple-tasks.dto';

@Injectable()
export class EventTaskService {
  constructor(
    @InjectModel(EventTask.name)
    private eventTaskModel: Model<EventTask>,
    @InjectModel(EventSubtask.name)
    private eventSubtaskModel: Model<EventSubtask>,
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
    @InjectModel(Worker.name)
    private workerModel: Model<Worker>,
    @InjectModel(WorkerType.name)
    private workerTypeModel: Model<WorkerType>,
    @InjectModel(EventType.name)
    private readonly taskEvidenceService: TaskEvidenceService,
  ) {}

  async findByStatus( status?: string): Promise<EventTask[]> {
    try {
      const query = status ? { status } : {};
      return await this.eventTaskModel.find(query).lean().exec();
    } catch (error) {
      throw new InternalServerErrorException(`Error finding tasks for event ${status}: ${error.message}`);
    }
  }

  // async findByEventId(eventId?: string): Promise<EventTask[]> {
  //   try {
  //     if (!eventId) {
  //       throw new BadRequestException('Event ID is required');
  //     }
  //     const objectId = new Types.ObjectId(eventId);
      
  //     const tasks = await this.eventTaskModel.find({ event: objectId }).lean().exec();
  //     const taskIds = tasks.map(t => t._id.toString());

  //     const evidences = await this.taskEvidenceService.findByTaskId(taskIds);

  //     const byTask = evidences.reduce((acc: any, e: any) => {
  //       const k = e.event_task_id.toString();
  //       (acc[k] = acc[k] || []).push(e);
  //       return acc;
  //     }, {});

  //     return tasks.map((t: any) => ({
  //       ...t,
  //       evidences: byTask[t._id.toString()] || [],
        
  //     }));

  //   } catch (error) {
  //     throw new InternalServerErrorException(`Error finding tasks for event ${eventId}: ${error.message}`);
  //   }
  // }

  async createMany(dto: CreateMultipleTasksDto) {
    const createdTasks = [];

    for (const taskDto of dto.tasks) {
      const created = await this.createSingleTask(taskDto);
      createdTasks.push(created);
    }

    return {
      count: createdTasks.length,
      tasks: createdTasks,
    };
  }

  async createSingleTask(dto: CreateEventTaskDto): Promise<{
    event_task: EventTask;
    subtasks: EventSubtask[];
  }> {
    try {
      const event = await this.eventModel.findById(dto.event_id);
      if (!event) throw new BadRequestException('El evento no existe');

      // 1. Crear actividad padre
      const eventTask = await new this.eventTaskModel({
        name: dto.task_name,
        description: dto.description,
        event: event._id,
        subtasks: [],
      }).save();

      const createdSubtasks: EventSubtask[] = [];
      const subtaskIds: Types.ObjectId[] = [];

      // 2. Crear subactividades
      for (const sub of dto.subtasks) {
        let worker = null;
        let worker_type = null;

        // SOLO buscar trabajador si viene worker_id
        if (sub.worker_id) {
          worker = await this.workerModel.findById(sub.worker_id);
          if (!worker) {
            throw new BadRequestException('Trabajador no encontrado para la subactividad');
          }

          worker_type = await this.workerTypeModel.findById(worker.worker_type);
          if (!worker_type) {
            throw new BadRequestException('Tipo de trabajador no encontrado para la subactividad');
          }
        }

        const newSubtask = await new this.eventSubtaskModel({
          parent_task: eventTask._id,

          is_for_storehouse: sub.is_for_storehouse,
          name: sub.subtask_name,
          price: sub.price ?? null,

          // Si no hay trabajador, que sea null
          worker: worker ? worker._id : null,
          worker_name: worker ? `${worker.first_name} ${worker.last_name}` : null,

          worker_type: worker_type ? worker_type._id : null,
          worker_type_name: worker_type ? worker_type.name : null,

          requires_evidence: sub.requires_evidence,

          storehouse_movement_type: sub.storehouse_movement_type || null,
          storehouse_code: sub.storehouse_code || null,

          phase: sub.phase,
          status: TaskStatusType.PENDIENTE,
          evidences: [],
        }).save();

        createdSubtasks.push(newSubtask);
        subtaskIds.push(newSubtask._id as Types.ObjectId);
      }

      // 3. Asociar subtareas al padre
      eventTask.subtasks = subtaskIds;
      await eventTask.save();

      return {
        event_task: eventTask,
        subtasks: createdSubtasks,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al crear actividad y subactividades',
      );
    }
  }

  async updateMany(dto: UpdateMultipleTasksDto) {
    const updatedTasks = [];

    for (const task of dto.tasks) {
      const updated = await this.updateSingleTask(task);
      updatedTasks.push(updated);
    }

    return {
      count: updatedTasks.length,
      tasks: updatedTasks,
    };
  }

  async updateSingleTask(
    dto: UpdateEventTaskDto
  ): Promise<{
    event_task: EventTask;
    subtasks: EventSubtask[];
  }> {
    try {
      // 1. Obtener el task padre
      const eventTask = await this.eventTaskModel.findById(dto.event_task_id);
      if (!eventTask) throw new NotFoundException('Event task not found');

      // 2. Eliminar subtasks actuales relacionados
      await this.eventSubtaskModel.deleteMany({
        parent_task: eventTask._id,
      });

      const createdSubtasks: EventSubtask[] = [];
      const subtaskIds: Types.ObjectId[] = [];

      // 3. Crear subtareas nuevas
      for (const sub of dto.subtasks) {
        const worker = await this.workerModel.findById(sub.worker_id);
        if (!worker) throw new BadRequestException('Trabajador no encontrado para la subactividad');

        const worker_type = await this.workerTypeModel.findById(worker.worker_type);
        if (!worker_type) throw new BadRequestException('Tipo de trabajador no encontrado para la subactividad');

        const newSubtask = await new this.eventSubtaskModel({
          parent_task: eventTask._id,
          is_for_storehouse: sub.is_for_storehouse,
          name: sub.subtask_name,
          price: sub.price ?? null,
          worker: worker._id,
          worker_name: `${worker.first_name} ${worker.last_name}`,
          worker_type: worker_type._id,
          worker_type_name: worker_type.name,
          requires_evidence: sub.requires_evidence,
          storehouse_movement_type: sub.storehouse_movement_type ?? null,
          storehouse_code: sub.storehouse_code ?? null,
          phase: sub.phase,
          status: TaskStatusType.PENDIENTE,
          evidences: [],
        }).save();

        createdSubtasks.push(newSubtask);
        subtaskIds.push(newSubtask._id as Types.ObjectId);
      }

      // 4. Actualizar el task padre
      eventTask.name = dto.task_name;
      eventTask.description = dto.description;
      eventTask.subtasks = subtaskIds;
      await eventTask.save();

      return {
        event_task: eventTask,
        subtasks: createdSubtasks,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al actualizar actividad y subactividades',
      );
    }
  }
}