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
import { ServicesDetailsPricesService } from './service-detail-prices.service';
import { Estado } from 'src/core/constants/app.constants';
import { parseDetailService, SF_SERVICE, toObjectId } from 'src/core/utils';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
    @InjectModel(Provider.name)
    private providerModel: Model<Provider>,
    @InjectModel(ServiceType.name)
    private serviceTypeModel: Model<ServiceType>,
    @InjectModel(ServiceDetail.name)
    private serviceDetailModel: Model<ServiceDetail>,
    private serviceDetailPricesService: ServicesDetailsPricesService,
  ) {}

  async create(
    dto: CreateServiceDto,
  ): Promise<{
    service: Service;
    serviceDetails: Array<ServiceDetail>;
  }> {
    try {
      // 1) Validar provider y tipo de servicio
      const provider = await this.providerModel.findById(dto.provider_id);
      if (!provider) throw new BadRequestException('Provider not found');

      const serviceType = await this.serviceTypeModel.findById(dto.service_type_id);
      if (!serviceType) throw new BadRequestException('Service type not found');

      if (!Array.isArray(dto.serviceDetails) || dto.serviceDetails.length === 0) {
        throw new BadRequestException('serviceDetails debe contener al menos un detalle');
      }

      // 2) Crear el servicio principal
      const service = await this.serviceModel.create({
        provider: toObjectId(provider._id),
        service_type: toObjectId(serviceType._id),
        provider_name: provider.name,
        service_type_name: serviceType.name,
        status: Estado.ACTIVO,
      });

      const serviceDetails: Array<ServiceDetail> = [];

      // 3) Crear cada detalle
      for (const d of dto.serviceDetails) {
        const detail = await this.serviceDetailModel.create({
          service_id: service._id,
          status: Estado.ACTIVO,
          ref_price: d.ref_price,
          details: parseDetailService(d.details),
        });

        serviceDetails.push(detail.toObject());

        this.serviceDetailPricesService.saveReferencePrice(detail._id, detail.ref_price);
      }

      return { service, serviceDetails };
    } catch (error) {
      console.error('Error en create service:', error);
      throw new InternalServerErrorException(
        `Error creating service: ${error.message}`,
      );
    }
  }


  async findAll(): Promise<Service[]> {
    try {
      return await this.serviceModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error obteniendo todos los servicios: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{
    total: number;
    items: Array<Service & { serviceDetails: Array<ServiceDetail> }>;
  }> {
    try {
      // 1) Filtro de búsqueda dinámico
      const filter = search
        ? {
            $or: SF_SERVICE.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      // 2) Orden dinámico
      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      // 3) Consultas en paralelo
      const [services, total] = await Promise.all([
        this.serviceModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 }) 
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .lean(),
        this.serviceModel.countDocuments(filter).exec(),
      ]);

      // 4) Obtener detalles relacionados para cada servicio
      const items = await Promise.all(
        services.map(async (service) => {
          const details = await this.serviceDetailModel
            .find({ service_id: service._id })
            .lean();

          return {
            ...service,
            serviceDetails: details,
          };
        }),
      );

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching paginated services with details: ${error.message}`,
      );
    }
  }

  async updateFullService(
    serviceId: string,
    dto: UpdateServiceDto,
  ): Promise<{
    service: Service;
    serviceDetails: Array<ServiceDetail>;
  }> {
    try {
      const service = await this.serviceModel.findById(serviceId);
      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }

      // Procesar y actualizar cada detalle
      for (const detailDto of dto.serviceDetails) {
        // si tengo un id, es porque ya existe y lo actualizo
        if (detailDto._id) {
          const detail = await this.serviceDetailModel.findById(detailDto._id);
          if (!detail) {
            throw new NotFoundException(
              `Service Detail with ID ${detailDto._id} not found`,
            );
          }

          // Actualizar estado (Activo/Inactivo)
          if (detailDto.status) {
            detail.status = detailDto.status;
          }

          // Actualizar atributos dinámicos
          if (detailDto.details) {
            detail.details = detailDto.details;
          }

          // Actualizar precio
          if (typeof detailDto.ref_price !== 'undefined') {
            detail.ref_price = detailDto.ref_price;
          }

          detail.season_number += 1;

          detail.last_price_updated_at = new Date();

          await detail.save();

          await this.serviceDetailPricesService.saveReferencePrice(detail._id, detail.ref_price);
        } else {
          // Si no tiene ID, es un nuevo detalle, así que lo creo
          const detail = await this.serviceDetailModel.create({
            service_id: service._id,
            status: detailDto.status ?? Estado.ACTIVO,
            ref_price: detailDto.ref_price,
            details: detailDto.details,
          });

          await this.serviceDetailPricesService.saveReferencePrice(detail._id, detail.ref_price);
        }
      }

      // Retornar servicio actualizado con sus detalles
      const updatedDetails = await this.serviceDetailModel
        .find({ service_id: service._id })
        .lean();

      return {
        service,
        serviceDetails: updatedDetails,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating service: ${error.message}`,
      );
    }
  }
}
