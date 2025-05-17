import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource } from '../schema/resource.schema';
import { CreateResourceDto, UpdateResourceDto } from '../dto';
import { SF_RESOURCE } from 'src/core/utils/searchable-fields';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource.name)
    private resourceModel: Model<Resource>
  ) {}

  async create(createResourceDto: CreateResourceDto): Promise<Resource> {
    try {
      const resource = await this.resourceModel.create(createResourceDto);
      return await resource.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error creating resource: ${error.message}`);
    }
  }

  async findAllPaginated(
      limit = 5,
      offset = 0,
      search = '',
      sortField: string,
      sortOrder: 'asc' | 'desc' = 'asc',
    ): Promise<{ total: number; items: Resource[] }> {
      try {
        // Notas:
        // 1) se filtra por nombre o descripción (Campos de la tabla)
        const filter = search
        ? {
            $or: SF_RESOURCE.map(field => ({
              [field]: { $regex: search, $options: 'i' }
            })),
          }
        : {};
  
        // 2) se ordena por el campo que se pasa por parámetro (Ascendente o Descendente)
        const sortObj: Record<string, 1 | -1> = {
          [sortField]: sortOrder === 'asc' ? 1 : -1,
        };
  
        const [items, total] = await Promise.all([
          this.resourceModel
            .find(filter)
            .collation({ locale: 'es', strength: 1 })
            .sort(sortObj)
            .skip(offset)
            .limit(limit)
            .exec(),
          this.resourceModel
            .countDocuments(filter)
            .exec(),
        ]);
  
        return { total, items };
      } catch (error) {
        throw new InternalServerErrorException(
          `Error finding resource with pagination: ${error.message}`,
        );
      }
    }

  async findOne(resource_id: string): Promise<Resource> {
    try {
      const resource = await this.resourceModel.findOne({ _id: resource_id });
      if (!resource) {
        throw new BadRequestException('Recurso no encontrado');
      }

      return resource;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error finding resource: ${error.message}`);
    }
  }

  async update(
    resource_id: string,
    updateResourceDto: UpdateResourceDto,
  ) {
    const resouce = await this.resourceModel.findOne({
      _id: resource_id,
    });
    if (!resouce) {
      throw new BadRequestException('Recurso no encontrado');
    }

    Object.assign(resouce, updateResourceDto);
    return await resouce.save();
  }
}
