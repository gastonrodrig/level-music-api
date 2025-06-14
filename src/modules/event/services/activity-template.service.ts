import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import { CreateActivityTemplateDto, UpdateActivityTemplateDto } from '../dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SF_ACTIVITY_TEMPLATE } from 'src/core/utils';
import { ActivityTemplate, EventType } from '../schema';
import { WorkerType } from 'src/modules/worker/schema';

@Injectable()
export class ActivityTemplateService {
  constructor(
    @InjectModel(ActivityTemplate.name)
    private activityTemplateModel: Model<ActivityTemplate>,
    @InjectModel(EventType.name)
    private eventTypeModel: Model<EventType>,
    @InjectModel(WorkerType.name)
    private workerTypeModel: Model<EventType>
  ) {}

  async create(createActivityTemplateDto: CreateActivityTemplateDto): Promise<ActivityTemplate> {
    try {
      const eventType = await this.eventTypeModel.findById(createActivityTemplateDto.event_type_id);
      if (!eventType) throw new BadRequestException('Event type not found');

      const workerType = await this.workerTypeModel.findById(createActivityTemplateDto.worker_type_id);
      if (!workerType) throw new BadRequestException('Worker type not found');

      const newActivityTemplate = new this.activityTemplateModel({
        ...createActivityTemplateDto,
        event_type: eventType._id,
        worker_type: workerType._id,
      })

      return await newActivityTemplate.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating activity template: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: ActivityTemplate[] }> {
    try {
      // Notas:
      // 1) se filtra por nombre o descripción (Campos de la tabla)
      const filter = search
      ? {
          $or: SF_ACTIVITY_TEMPLATE.map(field => ({
            [field]: { $regex: search, $options: 'i' }
          })),
        }
      : {};

      // 2) se ordena por el campo que se pasa por parámetro (Ascendente o Descendente)
      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.activityTemplateModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.activityTemplateModel
          .countDocuments(filter)
          .exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding activity template with pagination: ${error.message}`,
      );
    }
  }

  async findOne(template_id: string): Promise<ActivityTemplate> {
    try {
      const activityTemplate = await this.activityTemplateModel.findOne({
        _id: template_id,
      });
      if (!activityTemplate) {
        throw new BadRequestException('Plantilla de actividad no encontrado');
      }
      return activityTemplate
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding activity template: ${error.message}`,
      );
    }
  }

  async update(template_id: string, updateActivityTemplateDto: UpdateActivityTemplateDto): Promise<ActivityTemplate> {
    try {
      const activityTemplate = await this.activityTemplateModel.findOne({ _id: template_id });
      if (!activityTemplate) {
        throw new BadRequestException('Plantilla de actividad no encontrado');
      } 
      Object.assign(activityTemplate, updateActivityTemplateDto);
      return await activityTemplate.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}