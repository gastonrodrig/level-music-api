import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventTypeDto, UpdateEventTypeDto } from '../dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SF_EVENT_TYPE } from 'src/core/utils';
import { EventType } from '../schema';
import { errorCodes } from 'src/core/common';

@Injectable()
export class EventTypeService {
  constructor(
    @InjectModel(EventType.name)
    private eventTypeModel: Model<EventType>,
  ) {}

  async create(createEventTypeDto: CreateEventTypeDto): Promise<EventType> {
    try {
      const existing = await this.eventTypeModel.findOne({
        type: createEventTypeDto.type,
      });
      if (existing) {
        throw new HttpException(
          {
            code: errorCodes.EVENT_TYPE_ALREADY_EXISTS,
            message: `El tipo de evento "${createEventTypeDto.type}" ya existe.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const eventType = await this.eventTypeModel.create(createEventTypeDto);
      return await eventType.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
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

  async update(
    event_type_id: string,
    updateEventTypeDto: UpdateEventTypeDto,
  ): Promise<EventType> {
    try {
      const existingType = await this.eventTypeModel.findOne({
        type: updateEventTypeDto.type,
        _id: { $ne: event_type_id },
      });

      if (existingType) {
        throw new HttpException(
          {
            code: errorCodes.EVENT_TYPE_ALREADY_EXISTS,
            message: `El tipo de evento "${updateEventTypeDto.type}" ya existe.`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const updateEventType = await this.eventTypeModel.findByIdAndUpdate(
        event_type_id,
        updateEventTypeDto,
        { new: true },
      );

      if (!updateEventType) {
        throw new NotFoundException(
          `Event type with ID '${event_type_id}' not found`,
        );
      }

      return updateEventType;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}
