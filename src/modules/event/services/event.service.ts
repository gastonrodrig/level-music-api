import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuotationDto, UpdateQuotationDto } from '../dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SF_EVENT, toObjectId } from 'src/core/utils';
import { Assignation, Event, EventType } from '../schema';
import { User } from 'src/modules/user/schema';
import { StatusType } from '../enum';
import { AssignationsService } from './assignations.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UpdateStatusEventDto } from '../dto/update-status-event.dto';
import { errorCodes } from 'src/core/common';
import { PaymentSchedule } from 'src/modules/payment/schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
    @InjectModel(EventType.name)
    private eventTypeModel: Model<EventType>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Assignation.name)
    private assignationModel: Model<Assignation>,
    @InjectModel(PaymentSchedule.name)
    private paymentScheduleModel: Model<PaymentSchedule>,
    @InjectQueue('quotation-ready')
    private quotationReadyQueue: Queue,
    private assignationService: AssignationsService,
    @InjectQueue('purchase-order')
    private purchaseOrderQueue: Queue,
  ) {}

  async createQuotation(dto: CreateQuotationDto): Promise<Event> {
    try {
      // 1. Buscar tipo de evento
      const eventType = await this.eventTypeModel.findById(dto.event_type_id);
      if (!eventType) {
        throw new BadRequestException('Event type not found');
      }

      // 2. Generar código único de evento
      const startDate = dto.start_time
        ? new Date(dto.start_time).toISOString().slice(0, 10).replace(/-/g, '')
        : 'XXXXXX';

      let event_code = '';
      for (let i = 0; i < 8; i++) {
        const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
        const code = `EVT-${startDate}-${rnd}`;
        if (!(await this.eventModel.exists({ event_code: code }))) {
          event_code = code;
          break;
        }
      }

      // 3. Construir objeto base para el evento
      const eventToCreate: Partial<Event> = {
        ...dto,
        event_code,
        event_type: eventType._id,
        user: toObjectId(dto.user_id),
        status: StatusType.CREADO,
        final_price: 0,
        version: 1,
        is_latest: true,
      };

      // 4. Crear evento
      const event = await this.eventModel.create(eventToCreate);

      // 5. Crear asignaciones si vienen en el DTO
      if (dto.assignations?.length) {
        for (const assign of dto.assignations) {
          await this.assignationService.create({
            ...assign,
            event_id: event._id.toString(),
          });
        }
      }

      return event;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la cotización: ${error.message}`,
      );
    }
  }

  async findAllQuotationsPaginated(
    user_id?: string,
    limit = 5,
    offset = 0,
    search = '',
    sortField: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc',
    caseFilter?: number,
  ): Promise<{ total: number; items: any[] }> {
    try {
      const baseFilter: any = {};

      if (user_id) {
        baseFilter.user = toObjectId(user_id);
      }

      const statusCases: Record<number, string[]> = {
        1: ['Pagos Asignados', 'Creado', 'Editado'],
        2: ['En Seguimiento', 'Reprogramado', 'Finalizado'],
      };

      if (caseFilter && statusCases[caseFilter]) {
        baseFilter.status = { $in: statusCases[caseFilter] };
      }

      // Filtro de búsqueda
      const searchFilter = search
        ? {
            $or: SF_EVENT.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const filter = { ...baseFilter, ...searchFilter };

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      // Buscar eventos
      const [events, total] = await Promise.all([
        this.eventModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .lean(),
        this.eventModel.countDocuments(filter).exec(),
      ]);

      // Obtener asignaciones y pagos
      const items = await Promise.all(
        events.map(async (event) => {
          const [assignations, payment_schedules] = await Promise.all([
            this.assignationModel.find({ event: event._id }).lean(),
            this.paymentScheduleModel
              .find({ event: event._id })
              .sort({ due_date: 1 })
              .lean(),
          ]);

          return {
            ...event,
            assignations,
            payment_schedules,
          };
        }),
      );

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar cotizaciones: ${error.message}`,
      );
    }
  }

  async findEventVersionsByCode(
    event_code: string,
  ): Promise<any[]> {
    try {
      // Buscar todas las versiones del evento, ordenadas descendente por versión
      const events = await this.eventModel
        .find({ event_code })
        .sort({ version: -1 })
        .lean();

      // Agregar asignaciones a cada versión
      const eventsWithAssignations = await Promise.all(
        events.map(async (event) => {
          const assignations = await this.assignationModel
            .find({ event: event._id })
            .lean();

          return {
            ...event,
            assignations,
          };
        }),
      );

      return eventsWithAssignations;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar versiones de la cotización: ${error.message}`,
      );
    }
  }

  async updateQuotation(
    event_id: string,
    dto: UpdateQuotationDto,
  ): Promise<Event> {
    try {
      // Buscar la última versión del evento
      const currentEvent = await this.eventModel.findById(event_id);
      if (!currentEvent) {
        throw new NotFoundException('Evento no encontrado');
      }

      // Validar cruce de horarios
      const start = dto.start_time ?? currentEvent.start_time;
      const end = dto.end_time ?? currentEvent.end_time;

      const conflict = await this.eventModel.findOne({
        event_code: { $ne: currentEvent.event_code },
        $or: [{ start_time: { $lt: end }, end_time: { $gt: start } }],
      });

      if (conflict) {
        throw new HttpException(
          {
            code: errorCodes.EVENT_TIME_CONFLICT,
            message: 'El horario se cruza con otro evento existente',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Marcar el evento actual como histórico
      currentEvent.is_latest = false;
      currentEvent.status = StatusType.HISTORICO;
      await currentEvent.save();

      // Preparar la nueva versión
      const newEventData = {
        ...currentEvent.toObject(),
        ...dto, 
        _id: undefined, // Borra el _id
        version: currentEvent.version + 1,
        is_latest: true,
        status: StatusType.EDITADO,
        created_at: new Date(),
        updated_at: new Date(),
        event_type: dto.event_type_id ?? currentEvent.event_type,
      };

      const newEvent = await this.eventModel.create(newEventData);

      // Manejar asignaciones (opcional)
      if (dto.assignations?.length) {
        for (const assign of dto.assignations) {
          await this.assignationService.create({
            ...assign,
            event_id: newEvent._id.toString(),
          });
        }
      }

      // Retornar la nueva versión del evento
      return newEvent;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar la cotización: ${error.message}`,
      );
    }
  }

  async findByCode(event_code: string): Promise<Event> {
    try {
      const event = await this.eventModel.findOne({ event_code });
      if (!event) {
        throw new NotFoundException(
          `Evento con código ${event_code} no encontrado`,
        );
      }
      return event;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error al buscar evento por código: ${error.message}`,
      );
    }
  }

  async updateStatus(
    event_id: string,
    dto: UpdateStatusEventDto,
  ): Promise<Event> {
    try {
      const event = await this.eventModel.findById(event_id);
      if (!event) {
        throw new NotFoundException('Evento no encontrado');
      }

      if (dto.status) {
        event.status = dto.status;
      }

      return await event.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar el estado del evento: ${error.message}`,
      );
    }
  }
  
  async sendPurchaseOrdersToProviders(event_id: string) {
    const event = await this.eventModel.findById(event_id).lean();
    if (!event) throw new NotFoundException('Evento no encontrado');

    const assignations = await this.assignationModel.find({ event: event._id }).lean();
    if (!assignations.length) throw new BadRequestException('No hay asignaciones para este evento');

    const grouped = new Map<string, any[]>();

    for (const a of assignations) {
      const key = `${a.service_provider_email}||${a.service_provider_name}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(a);
    }

    for (const [key, providerAssignations] of grouped.entries()) {
      const [to, providerName] = key.split('||');

      await this.purchaseOrderQueue.add(
        'sendPurchaseOrderToProvider',
        {
          to,
          providerName,
          event,
          assignations: providerAssignations,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 1000,
          removeOnFail: 100,
        },
      );
    }

    return {
      message: 'Se han encolado los correos para los proveedores.',
      total: grouped.size,
    };
  }

}
