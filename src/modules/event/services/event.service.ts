import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from '../dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SF_EVENT, toObjectId } from 'src/core/utils';
import { Event, EventType } from '../schema';
import { User } from 'src/modules/user/schema';
import { CreateQuotationDto } from '../dto/create-quotation.dto';
import { StatusType } from '../enum';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
    @InjectModel(EventType.name)
    private eventTypeModel: Model<EventType>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    try {
      const eventType = await this.eventTypeModel.findById(createEventDto.event_type_id);
      if (!eventType) throw new BadRequestException('Event type not found');

      const user = await this.userModel.findById(createEventDto.user_id);
      if (!user) throw new BadRequestException('User not found');

      const ymd = new Date(createEventDto.date).toISOString().slice(0, 10).replace(/-/g, '');
      let event_code = '';
      for (let i = 0; i < 8; i++) {
        const rnd = Math.random().toString(36).slice(2, 8).toUpperCase(); // 6 chars
        const code = `EVT-${ymd}-${rnd}`;
        if (!(await this.eventModel.exists({ event_code: code }))) { event_code = code; break; }
      }
      if (!event_code) throw new InternalServerErrorException('No se pudo generar un event_code único');

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

  async createQuotation(dto: CreateQuotationDto, authUser?: any): Promise<Event> {
    try {
      // 1. Buscar tipo de evento
      const eventType = await this.eventTypeModel.findById(dto.event_type_id);
      if (!eventType) throw new BadRequestException('Event type not found');

      // 2. Generar código único de evento
      const ymd = dto.date
        ? new Date(dto.date).toISOString().slice(0, 10).replace(/-/g, '')
        : 'XXXXXX';

      let event_code = '';
      for (let i = 0; i < 8; i++) {
        const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
        const code = `EVT-${ymd}-${rnd}`;
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
      });

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

      const [items, total] = await Promise.all([
        this.eventModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.eventModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar eventos por usuario: ${error.message}`,
      );
    }
  }
}
