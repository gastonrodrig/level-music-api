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
import { toObjectId } from 'src/core/utils';
import { ServicesDetailsPricesService } from './service-detail-prices.service';
import { CreateServicesDetailsPricesDto } from '../dto/create-service-detail-prices.dto';
import { UpdateServiceDto, UpdateServiceDetailData } from '../dto/update-service.dto';

@Injectable()
export class ServiceDetailService {
  constructor(
    @InjectModel(ServiceDetail.name)
    private serviceDetailModel: Model<ServiceDetail>,
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
    @Inject(forwardRef(() => ServicesDetailsPricesService))
    private readonly serviceDetailPricesService: ServicesDetailsPricesService,
  ) {}
  // Obtener todos los detalles de servicio activos con nombre de tipo de servicio
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

  // Crear un nuevo detalle de servicio y registrar el precio inicial
  async createServiceDetailWithPrice(
    serviceDetailData: Partial<ServiceDetail>,
  ): Promise<ServiceDetail> {
    try {
      // Crear el detalle de servicio
      const newDetail = await this.serviceDetailModel.create(serviceDetailData);

      // Registrar el precio inicial en service-detail-prices
      if (serviceDetailData.ref_price !== undefined) {
        const priceDto: CreateServicesDetailsPricesDto = {
          reference_detail_price: serviceDetailData.ref_price,
          start_date: new Date(),
          end_date: null,
          service_detail_id: newDetail._id.toString(),
        };
        await this.serviceDetailPricesService.create(priceDto);
      }

      return newDetail;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear detalle de servicio y registrar precio: ${error.message}`,
      );
    }
  }
  // Actualizar varios detalles de servicio y registrar cambios de precios históricos
  async updateServiceDetails(
    dto: UpdateServiceDto,
  ): Promise<ServiceDetail[]> {
    try {
      const updatedDetails: ServiceDetail[] = [];
      for (const detailDto of dto.serviceDetails) {
        if (!detailDto._id) continue;
        const detail = await this.serviceDetailModel.findById(detailDto._id);
        if (!detail) continue;

        let priceChanged = false;
        if (
          detailDto.ref_price !== undefined &&
          detailDto.ref_price !== null &&
          detail.ref_price !== detailDto.ref_price
        ) {
          detail.ref_price = detailDto.ref_price;
          detail.last_price_update = new Date();
          priceChanged = true;
        }
        if (detailDto.details) {
          detail.details = detailDto.details;
        }
        if (detailDto.status) {
          detail.status = detailDto.status;
        }
        await detail.save();

        // Si el precio cambió, cerrar el anterior y registrar el nuevo en service-detail-prices
        if (priceChanged) {
          await this.serviceDetailPricesService.closePreviousPrices(detail._id.toString());
          const priceDto: CreateServicesDetailsPricesDto = {
            reference_detail_price: detailDto.ref_price!,
            start_date: new Date(),
            end_date: null,
            service_detail_id: detail._id.toString(),
          };
          await this.serviceDetailPricesService.create(priceDto);
        }
        updatedDetails.push(detail);
      }
      return updatedDetails;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar detalles de servicio: ${error.message}`,
      );
    }
  }
}
