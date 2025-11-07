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
  private readonly servicesDetailsPricesService: ServicesDetailsPricesService,
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

      // 2) Crear el servicio principal con fechas explícitas
      const now = new Date();
      const service = await this.serviceModel.create({
        provider: toObjectId(provider._id),
        service_type: toObjectId(serviceType._id),
        provider_name: provider.name,
        service_type_name: serviceType.name,
        status: Estado.ACTIVO,
        created_at: now,
        updated_at: now,
      });

      const serviceDetails: Array<ServiceDetail> = [];


      // 3) Crear cada detalle y su historial de precio inicial
      for (const d of dto.serviceDetails) {
        // Creamos el detalle y obtenemos el documento completo
        const detailDoc = await this.serviceDetailModel.create({
          service_id: service._id,
          status: Estado.ACTIVO,
          ref_price: d.ref_price,
          details: parseDetailService(d.details),
          detail_number: d.detail_number ?? 1,
        });

        // Usamos el _id real del detalle para el historial, incluyendo detail_number
        await this.servicesDetailsPricesService.create({
          reference_detail_price: d.ref_price,
          start_date: new Date(),
          end_date: null,
          service_detail_id: detailDoc._id.toString(),
          detail_number: detailDoc.detail_number ?? 1,
        });

        // Guardamos el documento completo (incluye _id)
        serviceDetails.push(detailDoc);
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


      for (const detailDto of dto.serviceDetails) {
        if (detailDto._id) {
          const detail = await this.serviceDetailModel.findById(detailDto._id);
          if (!detail) {
            throw new NotFoundException(
              `Service Detail with ID ${detailDto._id} not found`,
            );
          }

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
            await this.servicesDetailsPricesService.closePreviousPrices(detail._id.toString());
            await this.servicesDetailsPricesService.create({
              reference_detail_price: detailDto.ref_price!,
              start_date: new Date(),
              end_date: null,
              service_detail_id: detail._id.toString(),
            });
          }
        } else {
          // Nuevo detalle
          const newDetail = await this.serviceDetailModel.create({
            service_id: service._id,
            status: detailDto.status ?? Estado.ACTIVO,
            ref_price: detailDto.ref_price,
            details: detailDto.details,
          });
          // Registrar precio inicial si corresponde
          if (detailDto.ref_price !== undefined) {
            await this.servicesDetailsPricesService.create({
              reference_detail_price: detailDto.ref_price,
              start_date: new Date(),
              end_date: null,
              service_detail_id: newDetail._id.toString(),
            });
          }
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


async findOneWithDetails(serviceId: string): 
Promise<{ service: Service; serviceDetails: Array<ServiceDetail> }> {
  try {
    const service = await this.serviceModel.findById(serviceId).lean();
    if (!service) throw new NotFoundException(`Service with ID ${serviceId} not found`);

    const serviceDetails = await this.serviceDetailModel.find({ service_id: serviceId }).lean();

    return { service, serviceDetails };
  } catch (error) {
    throw new InternalServerErrorException(`Error fetching service: ${error.message}`);
  }
}

}
