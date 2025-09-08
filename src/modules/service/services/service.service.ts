import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDetail } from '../schema';
import { Model } from 'mongoose';
import { Provider } from '../../provider/schema';
import { ServiceType } from '../schema';
import { CreateServiceDto, UpdateServiceDto } from '../dto';
import { SF_SERVICE } from 'src/core/utils';
import { ServiceDetailMedia } from '../../uploads/schema/collection';
import { Estado } from 'src/core/constants/app.constants';
import { parseDetailService, toObjectId } from 'src/core/utils';
import { StorageService } from '../../firebase/services';
import { UploadResult } from 'src/core/interfaces';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
    @InjectModel(Provider.name)
    private providerModel: Model<Provider>,
    @InjectModel(ServiceType.name)
    private serviceTypeModel: Model<ServiceType>,
    @InjectModel(ServiceDetailMedia.name)
    private serviceMediaModel: Model<ServiceDetailMedia>,
    @InjectModel(ServiceDetail.name)
    private serviceDetailModel: Model<ServiceDetail>,
    private readonly storageService: StorageService,
    
  ) {}

  // Guiarse de aqui, solo cuando la tabla tiene ref's
  async create(
    createServiceDto: CreateServiceDto,
    media: Express.Multer.File[] = [],
  ): Promise<{ service: Service; detail: ServiceDetail; multimedia: ServiceDetailMedia[] }> {
    try {
      const provider = await this.providerModel.findById(createServiceDto.provider_id);
      if (!provider) throw new BadRequestException('Provider not found');
      
      const serviceType = await this.serviceTypeModel.findById(createServiceDto.service_type_id);
      if (!serviceType) throw new BadRequestException('Service type not found');
      
      const newService = await this.serviceModel.create({
        ...createServiceDto,
        status: Estado.ACTIVO,
        provider: toObjectId(provider._id),
        service_type: toObjectId(serviceType._id),
        provider_name: provider.name,
        service_type_name: serviceType.name,
      });
      
      const upload = await this.storageService.uploadMultipleFiles(
       'service-detail',
        media,
        'multimedia',
      ) as UploadResult[];

      const detail = await this.serviceDetailModel.create({
        details: parseDetailService(createServiceDto.details) ,
        service_id: newService._id,
        ref_price: createServiceDto.ref_price,
        multimedia: [],
      });

      const multimedia = upload.map((file) => ({
        url: file.url,
        name: file.name,
        size: file.size,
        storagePath: file.storagePath,
        detail_id: detail._id,
        created_at: new Date(),
      }));

      await this.serviceMediaModel.insertMany(multimedia);

      detail.multimedia = multimedia;
      await detail.save();

      return{
        service: await newService.save(),
        detail,
        multimedia,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating service: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Service[] }> {
    try {
      const filter = search
        ? {
            $or: SF_SERVICE.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.serviceModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.serviceModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding services with pagination: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<Service> {
    try {
      const service = await this.serviceModel.findById(id).exec();
      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }
      return service;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding service: ${error.message}`,
      );
    }
  }

  async update(
    service_id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    try {
      const updatedService = await this.serviceModel.findByIdAndUpdate(
        service_id,
        updateServiceDto,
        { new: true },
      );

      if (!updatedService) {
        throw new NotFoundException(`Service with ID ${service_id} not found`);
      }

      return updatedService;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating service: ${error.message}`,
      );
    }
  }
}
