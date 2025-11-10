import {
  Injectable,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDetail } from '../schema';
import { Model } from 'mongoose';
import { Estado } from 'src/core/constants/app.constants';
import { ServicesDetailsPricesService } from './service-detail-prices.service';
import { UpdateServiceDto } from '../dto/update-service.dto';

@Injectable()
export class ServiceDetailService {
  constructor(
    @InjectModel(ServiceDetail.name)
    private serviceDetailModel: Model<ServiceDetail>,
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
  ) {}

  async findAllActive(): Promise<any[]> {
    try {
      const serviceDetails = await this.serviceDetailModel
        .find({ status: Estado.ACTIVO })
        .lean()
        .exec();

      const enrichedDetails = await Promise.all(
        serviceDetails.map(async (detail) => {
          const service = await this.serviceModel.findById(detail.service_id).lean();

          return {
            ...detail,
            service_type_name: service.service_type_name,
          };
        }),
      );

      return enrichedDetails;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding all active service details: ${error.message}`,
      );
    }
  }
}
