import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reprogramings } from '../schema';

@Injectable()
export class ReprogramingsService {
  constructor(
    @InjectModel(Reprogramings.name)
    private reprogramingModel: Model<Reprogramings>,
  ) {}

  async create(CreateReprogramingsDto: Partial<Reprogramings>): Promise<Reprogramings> {
    try {
      const reprograming = new this.reprogramingModel(CreateReprogramingsDto);
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
              { previousTimeRange: { $regex: search, $options: 'i' } },
              { newTimeRange: { $regex: search, $options: 'i' } },
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
}