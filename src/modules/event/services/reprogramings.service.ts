import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, Reprogramings } from '../schema';
import { CreateReprogramingsDto } from '../dto';
import { StatusReprogramingsType } from '../enum';
import { toObjectId } from 'src/core/utils';


@Injectable()
export class ReprogramingsService {
  constructor(
    @InjectModel(Reprogramings.name)
    private reprogramingModel: Model<Reprogramings>,
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
  ) {}

  async create(createReprogramingsDto: CreateReprogramingsDto): Promise<Reprogramings> {
    try {
      const event = await this.eventModel.findById(createReprogramingsDto.event_id);     
      const reprograming = new this.reprogramingModel({
        ...createReprogramingsDto,
        previous_date: event.event_date,
        previous_start_time: event.start_time,
        previous_end_time: event.end_time,
        status: StatusReprogramingsType.PENDIENTE,
        event: event._id,
        user: event.user,
      })
      return await reprograming.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating reprograming: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Reprogramings[] }> {
    try {
      const filter = search
        ? {
            $or: [
              { reason: { $regex: search, $options: 'i' } },
              { previous_time_range: { $regex: search, $options: 'i' } },
              { new_time_range: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.reprogramingModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.reprogramingModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding reprogramings with pagination: ${error.message}`,
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
): Promise<{ total: number; items: Reprogramings[] }> {
  try {
    // 👇 conversión a ObjectId
    const baseFilter: any = { user: toObjectId(user_id) };

    const searchFields = ['reason', 'status'];
    const searchFilter = search
      ? {
          $or: searchFields.map((field) => ({
            [field]: { $regex: search, $options: 'i' },
          })),
        }
      : {};

    const filter = { ...baseFilter, ...searchFilter };

    const sortObj: Record<string, 1 | -1> = {
      [sortField]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.reprogramingModel
        .find(filter)
        .collation({ locale: 'es', strength: 1 })
        .sort(sortObj)
        .skip(offset)
        .limit(limit)
        .exec(),
      this.reprogramingModel.countDocuments(filter).exec(),
    ]);

    return { total, items };
  } catch (error) {
    throw new InternalServerErrorException(
      `Error al buscar reprogramaciones por usuario: ${error.message}`,
    );
  }
}
}