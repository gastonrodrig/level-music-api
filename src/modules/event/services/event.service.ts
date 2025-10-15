import { 
  BadRequestException, 
  HttpException, 
  HttpStatus, 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import {
  CreateQuotationLandingDto,
  CreateQuotationAdminDto,
  UpdateEventWithResourcesDto,
  UpdateQuotationAdminDto,
} from '../dto';
import { CreateEventDto, UpdateEventDto } from '../dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SF_EVENT, toObjectId } from 'src/core/utils';
import { Assignation, Event, EventType } from '../schema';
import { User } from 'src/modules/user/schema';
import { QuotationCreator, StatusType } from '../enum';
import { AssignationsService } from './assignations.service';
import { ClientType } from 'src/modules/user/enum/client-type.enum';
import { ActivationTokenService } from 'src/auth/services/activation-token.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UpdateStatusEventDto } from '../dto/update-status-event.dto';
import { errorCodes } from 'src/core/common';

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
    @InjectQueue('quotation-ready')
    private quotationReadyQueue: Queue,
    private assignationService: AssignationsService,
    private activationTokenService: ActivationTokenService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    try {
      const eventType = await this.eventTypeModel.findById(createEventDto.event_type_id);
      if (!eventType) throw new BadRequestException('Event type not found');

      const user = await this.userModel.findById(createEventDto.user_id);
      if (!user) throw new BadRequestException('User not found');

      const startDate = createEventDto.start_time 
        ? new Date(createEventDto.start_time).toISOString().slice(0, 10).replace(/-/g, '')
        : 'XXXXXX';

      let event_code = '';
      for (let i = 0; i < 8; i++) {
        const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
        const code = `EVT-${startDate}-${rnd}`;
        
        // Validamos que no exista ya este código
        if (!(await this.eventModel.exists({ event_code: code }))) {
          event_code = code;
          break;
        }
      }

      const event = new this.eventModel({
        ...createEventDto,
        event_code,
        event_type: eventType._id,
        user: user._id,
      });

      return await event.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating event: ${error.message}`,
      );
    }
  }

  async createQuotationLanding(dto: CreateQuotationLandingDto): Promise<Event> {
    try {
      // 1. Buscar tipo de evento
      const eventType = await this.eventTypeModel.findById(dto.event_type_id);
      if (!eventType) throw new BadRequestException('Event type not found');

      // 2. Generar código único de evento
      const startDate = dto.start_time 
        ? new Date(dto.start_time).toISOString().slice(0, 10).replace(/-/g, '')
        : 'XXXXXX';

      let event_code = '';
      for (let i = 0; i < 8; i++) {
        const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
        const code = `EVT-${startDate}-${rnd}`;
        
        // Validamos que no exista ya este código
        if (!(await this.eventModel.exists({ event_code: code }))) {
          event_code = code;
          break;
        }
      }

      // 3. Crear evento con client_info siempre embebido
      const event = await this.eventModel.create({
        ...dto,
        event_code, 
        event_type: eventType._id,
        client_info: dto.client_info, 
        user: toObjectId(dto.user_id), 
        status: StatusType.PENDIENTE_APROBACION,
        estimated_price: 0,
        final_price: 0,
        creator: QuotationCreator.CLIENTE,
      });

      return event;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la cotización: ${error.message}`,
      );
    }
  }

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
        status: StatusType.PENDIENTE_APROBACION,
        estimated_price: dto.estimated_price ?? 0,
        final_price: 0,
        creator: QuotationCreator.ADMIN,
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

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Event[] }> {
    try {
      // Notas:
      // 1) se filtra por nombre o descripción (Campos de la tabla)
      const filter = search
      ? {
          $or: SF_EVENT.map(field => ({
            [field]: { $regex: search, $options: 'i' }
          })),
        }
      : {};

      // 2) se ordena por el campo que se pasa por parámetro (Ascendente o Descendente)
      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.eventModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.eventModel
          .countDocuments(filter)
          .exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding event with pagination: ${error.message}`,
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
      code: errorCodes.EVENT_TIME_CONFLICT, // Usa el código que prefieras, puedes crear uno específico como EVENT_TIME_CONFLICT
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

  async findAllQuotationPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{
    total: number;
    items: Array<Event & { assignations: Array<Assignation> }>;
  }> {
    try {
      // 1) Filtro base: solo cotizaciones
      const baseFilter: any = { creator: { $exists: true } };

      // 2) Filtro de búsqueda
      const searchFilter = search
        ? {
            $or: SF_EVENT.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const filter = { ...baseFilter, ...searchFilter };

      // 3) Orden dinámico
      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      // 4) Consultas en paralelo
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

      // 5) Obtener asignaciones relacionadas para cada evento
      const items = await Promise.all(
        events.map(async (event) => {
          const assignations = await this.assignationModel
            .find({ event: event._id })
            .lean();

          return {
            ...event,
            assignations, // 👈 aquí agregamos el array con todas las asignaciones del evento
          };
        }),
      );

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching quotations with assignations: ${error.message}`,
      );
    }
  }

  async findOne(event_id: string): Promise<Event> {
    try {
      const event = await this.eventModel.findOne({
        _id: event_id,
      });
      if (!event) {
        throw new BadRequestException('Tipo de evento no encontrado');
      }
      return event
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding event type: ${error.message}`,
      );
    }
  }

  async update(event_id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    try {
      const eventType = await this.eventModel.findOne({ _id: event_id });
      if (!eventType) {
        throw new BadRequestException('Tipo de evento no encontrado');
      }
      Object.assign(eventType, updateEventDto);
      return await eventType.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
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

  async findByUserPaginated(
    user_id: string,
    limit = 5,
    offset = 0,
    search = '',
    sortField: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Event[] }> {
    try {
      const baseFilter: any = { user: toObjectId(user_id) };
      const searchFilter = search
        ? {
            $or: SF_EVENT.map(field => ({
              [field]: { $regex: search, $options: 'i' }
            })),
          }
        : {};
      const filter = { ...baseFilter, ...searchFilter };

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

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

    // Obtener asignaciones para cada evento
    const items = await Promise.all(
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
      
      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar eventos por usuario: ${error.message}`,
      );
    }
  }

  async assignResources(
    event_id: string,
    dto: UpdateEventWithResourcesDto,
  ): Promise<Event> {
    try {
      const event = await this.eventModel.findById(event_id);
      if (!event) {
        throw new NotFoundException('Evento no encontrado');
      }

      if (dto.name) event.name = dto.name;
      if (dto.description) event.description = dto.description;

      if (dto.resources?.length) {
        for (const resource of dto.resources) {
          await this.assignationService.create({
            ...resource,
            event_id: event._id.toString(),
          });
        }
      }

      if (!event.user) {
        event.status = StatusType.ESPERA_REGISTRO; 
      } else {
        event.status = StatusType.REVISION_CLIENTE; 
      }

      await event.save();

      const user = event.user ? await this.userModel.findById(event.user) : null;

      const clientEmail = user ? user.email : event.client_info.email;
      const clientName =
        event.client_info.client_type === ClientType.PERSONA
          ? `${event.client_info.first_name} ${event.client_info.last_name}`
          : `${event.client_info.company_name}`;

      let activationUrl = null;
      if (!user) {
        const { token } = await this.activationTokenService.issueToken({
          email: clientEmail,
          eventId: event._id.toString(),
          ttlMs: 24 * 60 * 60 * 1000, 
        });
        activationUrl = `${process.env.APP_URL}/t/${token}`;
      }

      await this.quotationReadyQueue.add(
        'sendQuotationReady',
        {
          to: clientEmail,
          clientName,
          activationUrl,
          hasAccount: user ? true : false,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 1000,
          removeOnFail: 100,
        },
      );

      return event;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar evento y asignar recursos: ${error.message}`,
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

      if(dto.status === StatusType.APROBADO) {
        // Lógica adicional para el estado APROBADO
      }

      return await event.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar el estado del evento: ${error.message}`,
      );
    }
  }
async findByStatus(status: string): Promise<Event[]> {
  // Lista de estados válidos
  const validStatuses = [
  'Pendiente de Aprobación',
  'En Espera de Registro',
  'Pendiente de Revisión del Cliente',
  'Rechazado',
  'Aprobado',
  'Pagos Asignados',
];

  if (!validStatuses.includes(status)) {
    throw new BadRequestException('Estado inválido');
  }

  return await this.eventModel.find({ status }).lean();
}

async findByPaymentStatus(status: string): Promise<Event[]> {
  const validStatuses = [
    'En Seguimiento',
    'Reprogramado',
    'Finalizado',
  ];

  if (!validStatuses.includes(status)) {
    throw new BadRequestException('Estado inválido');
  }

  return await this.eventModel.find({ status }).lean();
}

}
