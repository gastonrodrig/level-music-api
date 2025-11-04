import { 
  BadRequestException, 
  HttpException, 
  HttpStatus, 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import {
  CreateQuotationAdminDto,
  UpdateQuotationAdminDto,
} from '../dto';
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
  ) {}

  async createQuotationAdmin(dto: CreateQuotationAdminDto): Promise<Event> {
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
      const eventToCreate: any = {
        ...dto,
        event_code,
        event_type: eventType._id,
        client_info: dto.client_info,
        user: toObjectId(dto.user_id),
        status: StatusType.PENDIENTE_CONFIGURACION,
        estimated_price: dto.estimated_price ?? 0,
        final_price: 0,
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
    caseFilter?: number
  ): Promise<{ total: number; items: any[] }> {
    try {
      const baseFilter: any = {};

      if (user_id) {
        baseFilter.user = toObjectId(user_id);
      }

      const statusCases: Record<number, string[]> = {
        1: [
          'Pendiente de Aprobación',
          'En Espera de Registro',
          'Pendiente de Revisión del Cliente',
          'Rechazado',
          'Aprobado',
          'Pagos Asignados',
        ],
        2: [
          'En Seguimiento', 
          'Reprogramado', 
          'Finalizado'
        ]
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

  async updateQuotationAdmin(
    event_id: string,
    dto: UpdateQuotationAdminDto,
  ): Promise<Event> {
    try {
      // 1. Buscar evento existente
      const event = await this.eventModel.findById(event_id);
      if (!event) {
        throw new NotFoundException('Evento no encontrado');
      }

        // Validación de cruce de horarios
      const start = dto.start_time ?? event.start_time;
      const end = dto.end_time ?? event.end_time;

      const cruzado = await this.eventModel.findOne({
        _id: { $ne: event_id },
        $or: [
          {
            start_time: { $lt: end },
            end_time: { $gt: start }
          }
        ]
      });

      if (cruzado) {
        throw new HttpException(
          {
            code: errorCodes.EVENT_TIME_CONFLICT,
            message: 'El horario se cruza con otro evento existente',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Si envía un tipo de evento distinto, validarlo
      if (dto.event_type_id) {
        const eventType = await this.eventTypeModel.findById(dto.event_type_id);
        if (!eventType) {
          throw new BadRequestException('Event type not found');
        }
        event.event_type = eventType._id;
      }

      // 3. Actualizar datos básicos del evento
      event.name = dto.name ?? event.name;
      event.description = dto.description ?? event.description;
      event.start_time = dto.start_time ?? event.start_time;
      event.end_time = dto.end_time ?? event.end_time;
      event.attendees_count = dto.attendees_count ?? event.attendees_count;
      event.exact_address = dto.exact_address ?? event.exact_address;
      event.location_reference = dto.location_reference ?? event.location_reference;
      event.place_type = dto.place_type ?? event.place_type;
      event.place_size = dto.place_size ?? event.place_size;
      event.estimated_price = dto.estimated_price ?? event.estimated_price;
      event.final_price = dto.final_price ?? event.final_price;

      // 4. Actualizar client_info si viene
      if (dto.client_info) {
        event.client_info = {
          ...event.client_info,
          ...dto.client_info,
        };
      }

      // 5. Guardar cambios del evento
      const updatedEvent = await event.save();

      // 6. Manejar asignaciones
      if (dto.assignations) {
        //  opción simple: borrar todas y recrear
        await this.assignationService.deleteByEventId(event._id.toString());

        for (const assign of dto.assignations) {
          await this.assignationService.create({
            ...assign,
            event_id: event._id.toString(),
          });
        }
      }

      return updatedEvent;
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
        throw new NotFoundException(`Evento con código ${event_code} no encontrado`);
      }
      return event;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error al buscar evento por código: ${error.message}`,
      );
    }
  }

  async updateStatus(event_id: string, dto: UpdateStatusEventDto): Promise<Event> {
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
}
