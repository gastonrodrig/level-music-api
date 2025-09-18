import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Incident } from '../schema/incident.schema';
import { Resource } from 'src/modules/resources/schema';

@Injectable()
export class IncidentService {
  constructor(
    @InjectModel(Incident.name)
    private incidentModel: Model<Incident>,
    @InjectModel(Resource.name)
    private resourceModel: Model<Resource>,
  ) {}

  async create(createIncidentDto: any): Promise<Incident> {
    try {
      const resource = await this.resourceModel.findById(createIncidentDto.resource);
      if (!resource) throw new BadRequestException('Resource not found');
      const incident = new this.incidentModel({
        ...createIncidentDto,
        created_at: new Date(),
      });
      return await incident.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error creating incident: ${error.message}`);
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Incident[] }> {
    try {
      const filter = search
        ? {
            $or: [
              { description: { $regex: search, $options: 'i' } },
              { incident_location: { $regex: search, $options: 'i' } },
            ],
          }
        : {};
      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };
      const [items, total] = await Promise.all([
        this.incidentModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.incidentModel.countDocuments(filter).exec(),
      ]);
      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(`Error finding incidents with pagination: ${error.message}`);
    }
  }
}