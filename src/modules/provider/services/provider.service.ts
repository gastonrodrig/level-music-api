import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Provider } from '../schema';
import { Model } from 'mongoose';
import { CreateProviderDto, UpdateProviderDto } from '../dto';
import { SF_PROVIDER } from 'src/core/utils';
import { Service } from '../../service/schema';

@Injectable()
export class ProviderService {
  constructor(
    @InjectModel(Provider.name)
    private providerModel: Model<Provider>,
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    try {
      const provider = await this.providerModel.create(createProviderDto);
      return await provider.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating provider: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Provider[] }> {
    try {
      const filter = search
      ? {
          $or: SF_PROVIDER.map(field => ({
            [field]: { $regex: search, $options: 'i' }
          })),
        }
      : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.providerModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.providerModel
          .countDocuments(filter)
          .exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding providers with pagination: ${error.message}`,
      );
    }
  }

  async findOne(provider_id: string): Promise<Provider> {
    try {
      const provider = await this.providerModel.findOne({ _id: provider_id });
      if (!provider) {
        throw new InternalServerErrorException('Provider not found');
      }

      return provider;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding provider: ${error.message}`,
      );
    }
  }

  async update(id: string, updateProviderDto: UpdateProviderDto): Promise<Provider> {
    try {
      const updatedProvider = await this.providerModel.findOneAndUpdate(
        { _id: id },  
        updateProviderDto,
        { new: true }
      ).exec();
      if (!updatedProvider) {
        throw new NotFoundException(`Provider with ID ${id} not found`);
      }

      // Denormalización: actualiza provider_name en los servicios relacionados
      await this.serviceModel.updateMany(
        { provider: updatedProvider._id },
        { $set: { provider_name: updatedProvider.name } }
      );

      return updatedProvider;
    } catch (error) {
      throw new InternalServerErrorException(`Error updating provider: ${error.message}`);
    }
  }
}
