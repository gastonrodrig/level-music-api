import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventTypeDto, UpdateEventTypeDto } from '../dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SF_EVENT_TYPE } from 'src/core/utils';
import { EventType } from '../schema';

@Injectable()
export class EventTypeService {
  constructor(
    @InjectModel(EventType.name)
    private eventTypeModel: Model<EventType>,
  ) {}

  async create(createEventTypeDto: CreateEventTypeDto): Promise<EventType> {
    try {
      const eventType = await this.eventTypeModel.create(createEventTypeDto);
      return await eventType.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating event type: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: EventType[] }> {
    try {
      const filter = search
        ? {
            $or: SF_EVENT_TYPE.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.eventTypeModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.eventTypeModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding worker types with pagination: ${error.message}`,
      );
    }
  }

  async findOne(event_type_id: string): Promise<EventType> {
    try {
      const eventType = await this.eventTypeModel.findOne({
        _id: event_type_id,
      });
      if (!eventType) {
        throw new BadRequestException('Tipo de evento no encontrado');
      }
      return eventType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding event type: ${error.message}`,
      );
    }
  }

  async update(event_type_id: string, updateEventTypeDto: UpdateEventTypeDto): Promise<EventType> {
    try {
      const eventType = await this.eventTypeModel.findOne({ _id: event_type_id });
      if (!eventType) {
        throw new BadRequestException('Tipo de evento no encontrado');
      }
      Object.assign(eventType, updateEventTypeDto);
      return await eventType.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}
