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

@Injectable()
export class EventTaskService {
  constructor(
    @InjectModel(EventTask.name)
    private eventTaskModel: Model<EventTask>,
    @InjectModel(EventSubtask.name)
    private eventSubtaskModel: Model<EventSubtask>,
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
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

  async create(dto: CreateEventTaskDto): Promise<{
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
        const newSubtask = await new this.eventSubtaskModel({
          parent_task: eventTask._id,
          is_for_storehouse: sub.is_for_storehouse,
          name: sub.subtask_name,
          price: sub.price ?? null,
          worker: sub.worker, // Puede venir 1 o varios workers
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

      // 3. Asociar subtareas al padre
      eventTask.subtasks = subtaskIds;
      await eventTask.save();

      // 4. Recalcular el estimated_price del evento
      await this.recalculateEstimatedPrice(event._id);

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

  async update(
    eventTaskId: string,
    dto: UpdateEventTaskDto
  ): Promise<{
    event_task: EventTask;
    subtasks: EventSubtask[];
  }> {
    try {
      // 1. Obtener el task padre
      const eventTask = await this.eventTaskModel.findById(eventTaskId);
      if (!eventTask) throw new NotFoundException('Event task not found');

      // 2. Eliminar subtasks actuales relacionados
      await this.eventSubtaskModel.deleteMany({
        parent_task: eventTask._id,
      });

      const createdSubtasks: EventSubtask[] = [];
      const subtaskIds: Types.ObjectId[] = [];

      // 3. Crear subtareas nuevas
      for (const sub of dto.subtasks) {
        const newSubtask = await new this.eventSubtaskModel({
          parent_task: eventTask._id,
          is_for_storehouse: sub.is_for_storehouse,
          name: sub.subtask_name,
          price: sub.price ?? null,
          worker: sub.worker, // Puede venir 1 o varios workers
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

      // 5. Recalcular el estimated_price del evento
      await this.recalculateEstimatedPrice(eventTask.event);

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

  private async recalculateEstimatedPrice(eventId: any) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new BadRequestException('El evento no existe');

    // Obtener todas las actividades del evento
    const tasks = await this.eventTaskModel.find({ event: eventId });
    const taskIds = tasks.map(t => t._id);

    // Obtener todas las subtareas asociadas
    const subtasks = await this.eventSubtaskModel.find({
      parent_task: { $in: taskIds },
    });

    // Sumar precios (solo los que NO son null)
    const subtaskTotal = subtasks.reduce(
      (sum, st) => sum + (st.price ? Number(st.price) : 0),
      0
    );

    // Calcular nuevo estimated_price FINAL
    const finalEstimatedPrice =
      Number(event.estimated_price) + subtaskTotal;

    // Guardar
    await this.eventModel.findByIdAndUpdate(eventId, {
      estimated_price: finalEstimatedPrice,
    });

    return finalEstimatedPrice;
  }

  // async update(event_task_id: string, updateEventTaskDto: UpdateEventTaskDto): Promise<EventTask> {
  //   try {
  //     const eventTask = await this.eventTaskModel.findOne({ _id: event_task_id });
  //     if (!eventTask) {
  //       throw new BadRequestException('Tarea de evento no encontrado');
  //     }
     
  //     const worker = await this.workerModel.findById(updateEventTaskDto.worker_id).lean();
  //     if (!worker) throw new BadRequestException('Trabajador no encontrado');
  //     eventTask.worker = worker._id;
  //     eventTask.worker_name = `${worker.first_name} ${worker.last_name}`.trim();
  //     const workerType = await this.workerTypeModel.findById(worker.worker_type).lean();
  //     if (!workerType) throw new BadRequestException('Tipo de trabajador no encontrado');
  //     eventTask.worker_type = workerType._id;
  //     eventTask.worker_type_name = workerType.name;
      
  //     Object.assign(eventTask, updateEventTaskDto);
  //     return await eventTask.save();
  //   } catch (error) {
  //     throw new InternalServerErrorException(`Error: ${error.message}`);
  //   }
  // }
}