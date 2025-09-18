import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SF_INCIDENTS, toObjectId } from 'src/core/utils';
import { Incident, Event } from 'src/modules/event/schema';
import { Resource } from 'src/modules/resources/schema';
import { Worker } from 'src/modules/worker/schema';
import { CreateIncidentDto } from '../dto';

@Injectable()
export class IncidentService {
  constructor(
    @InjectModel(Incident.name)
    private incidentModel: Model<Incident>,
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
    @InjectModel(Resource.name)
    private resourceModel: Model<Resource>,
    @InjectModel(Worker.name)
    private workerModel: Model<Worker>,
  ) {}

  async create(createIncidentDto: CreateIncidentDto): Promise<Incident> {
    try {
      const event = await this.eventModel.findById(createIncidentDto.event_id);
      if (!event) throw new BadRequestException('Event not found');

      const resource = await this.resourceModel.findById(createIncidentDto.resource_id);
      if (!resource) throw new BadRequestException('Resource not found');

      const worker = await this.workerModel.findById(createIncidentDto.worker_id);
      if (!worker) throw new BadRequestException('Worker not found');

      const incident = new this.incidentModel({
        ...createIncidentDto,
        event: toObjectId(event._id),
        resource: toObjectId(createIncidentDto.resource_id),
        worker: toObjectId(worker._id),
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
            $or: SF_INCIDENTS.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
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