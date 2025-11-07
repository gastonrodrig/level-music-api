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
import { Estado } from 'src/core/constants/app.constants';
import { parseDetailService, SF_SERVICE, toObjectId } from 'src/core/utils';
import { ServiceMedia } from '../schema';
import { MediaServiceService } from './service-media.service';

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
    @InjectModel(ServiceMedia.name)
    private serviceMediaModel: Model<ServiceMedia>,
    private readonly mediaService: MediaServiceService,
  ) {}

  async create(
    dto: CreateServiceDto,
    photos:Array<Express.Multer.File> = [],
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
      const pricesService = (await import('./service-detail-prices.service')).ServicesDetailsPricesService;
      const pricesServiceInstance = new pricesService(
        this.serviceDetailModel.db.model('ServiceDetailPrice')
      );
      for (const d of dto.serviceDetails) {
        const detailNum = d.detail_number ?? 1;
        // Creamos el detalle y obtenemos el documento completo
        const detailDoc = await this.serviceDetailModel.create({
          service_id: service._id,
          status: Estado.ACTIVO,
          ref_price: d.ref_price,
          details: parseDetailService(d.details),
          detail_number: detailNum,
          photos: []
        });

        // Usamos el _id real del detalle para el historial, incluyendo detail_number
        await pricesServiceInstance.create({
          reference_detail_price: d.ref_price,
          start_date: new Date(),
          end_date: null,
          service_detail_id: detailDoc._id.toString(),
          detail_number: detailDoc.detail_number ?? 1,
        });

        const photosForThisDetail = photos.filter(
          (file) => file.fieldname === `photos_${detailNum}`
        );

        if (photosForThisDetail && photosForThisDetail.length) {
          // 5) Llamamos al servicio de media CON EL ID DEL DETALLE
          const createdPhotos = await this.mediaService.createMediaForService(
            detailDoc._id.toString(), // <-- ID CORREGIDO
            photosForThisDetail,
          );
          
          if (Array.isArray(createdPhotos) && createdPhotos.length) {
            // 6) Guardamos los IDs de las fotos EN EL DETALLE
            detailDoc.photos = createdPhotos.map((m: any) => m._id);
            await detailDoc.save(); // Guardamos el detalle actualizado
          }
        }

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
            .populate('photos')
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
    photos: Express.Multer.File[] = [],
    photos_to_delete: string[] = [],
  ): Promise<{
    service: Service;
    serviceDetails: Array<ServiceDetail>;
  }> {
    try {
      const service = await this.serviceModel.findById(serviceId);
      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }

      // Validar dto.serviceDetails
      if (!Array.isArray(dto.serviceDetails)) {
        throw new BadRequestException('serviceDetails must be an array');
      }

      // 1. BORRAR FOTOS (SOLO LLAMAMOS AL SERVICIO DE MEDIA)
      if (Array.isArray(photos_to_delete) && photos_to_delete.length > 0) {
        await this.mediaService.deleteMedia(photos_to_delete); 
        // ¡YA NO SE NECESITA EL 'updateMany' AQUÍ!
      }

      // 2. AGRUPAR ARCHIVOS NUEVOS (Esto está perfecto)
      const filesByField: Record<string, Express.Multer.File[]> = (photos || []).reduce((acc, f) => {
        const k = f.fieldname || 'photos';
        acc[k] = acc[k] || [];
        acc[k].push(f);
        return acc;
      }, {} as Record<string, Express.Multer.File[]>);

      // 3. PREPARAR EL SERVICIO DE PRECIOS (Esto está perfecto)
      const pricesService = (await import('./service-detail-prices.service')).ServicesDetailsPricesService;
      const pricesServiceInstance = new pricesService(
        this.serviceDetailModel.db.model('ServiceDetailPrice')
      );

      // 4. PROCESAR CADA DETALLE
      for (const detailDto of dto.serviceDetails) {
        let detailDoc;
        
        // CORREGIDO: Usamos el detail_number del DTO (que ya añadiste)
        const detailNum = detailDto.detail_number ?? 1; 

        // --- 4A. DETALLE EXISTENTE (Actualizar) ---
        if (detailDto._id) {
          detailDoc = await this.serviceDetailModel.findById(detailDto._id);
          if (!detailDoc) {
            console.warn(`Service Detail with ID ${detailDto._id} not found, skipping.`);
            continue;
          }

          if (typeof detailDto.status !== 'undefined') detailDoc.status = detailDto.status;
          if (typeof detailDto.details !== 'undefined') detailDoc.details = parseDetailService(detailDto.details);

          // Lógica de historial de precios (¡Esto está genial!)
          if (typeof detailDto.ref_price !== 'undefined' && detailDoc.ref_price !== detailDto.ref_price) {
            detailDoc.ref_price = detailDto.ref_price;
            await pricesServiceInstance.create({
              reference_detail_price: detailDto.ref_price,
              start_date: new Date(),
              end_date: null,
              service_detail_id: detailDoc._id.toString(), // <-- Aquí se usa el ID, está correcto
              detail_number: detailDoc.detail_number ?? 1,
            });
            detailDoc.last_price_update = new Date();
          }

        // --- 4B. DETALLE NUEVO (Crear) ---
        } else {
          detailDoc = await this.serviceDetailModel.create({
            service_id: service._id,
            status: detailDto.status ?? Estado.ACTIVO,
            ref_price: detailDto.ref_price,
            details: parseDetailService(detailDto.details),
            detail_number: detailNum,
            photos: [],
          });

          // Crear historial de precio para el nuevo detalle
          await pricesServiceInstance.create({
            reference_detail_price: detailDto.ref_price,
            start_date: new Date(),
            end_date: null,
            service_detail_id: detailDoc._id.toString(), // <-- Aquí se usa el ID, está correcto
            detail_number: detailDoc.detail_number ?? 1,
          });
        }

        // --- 4C. PROCESAR FOTOS ---

        // Asegurar que el array 'photos' exista
        detailDoc.photos = Array.isArray(detailDoc.photos) ? detailDoc.photos : [];
        
        // ELIMINAMOS EL BLOQUE CONFUSO DE 'photos_ids'

        // Procesar archivos subidos para este detalle
        const key = `photos_${detailNum}`;
        const filesForDetail = filesByField[key] || [];
        
        if (filesForDetail.length) {
          const created = await this.mediaService.createMediaForService(detailDoc._id.toString(), filesForDetail);
          if (Array.isArray(created) && created.length) {
            // Unimos las fotos existentes con las nuevas y evitamos duplicados
            const existingPhotoIds = detailDoc.photos.map(String);
            const newPhotoIds = created.map((c: any) => String(c._id));
            detailDoc.photos = Array.from(new Set([...existingPhotoIds, ...newPhotoIds]));
          }
        }

        await detailDoc.save(); // Guardar todos los cambios del detalle
      } // fin loop detalles

      // actualizar timestamp del servicio
      service.updated_at = new Date();
      await service.save();

      const updatedDetails = await this.serviceDetailModel.find({ service_id: service._id }).lean();

      return {
        service,
        serviceDetails: updatedDetails,
      };
    } catch (error) {
      console.error('Error en updateFullService:', error);
      throw new InternalServerErrorException(`Error updating service: ${error.message}`);
    }
  }

// ...existing code...

async findOneWithDetails(serviceId: string): 
Promise<{ service: Service; serviceDetails: Array<ServiceDetail> }> {
  try {
    const service = await this.serviceModel.findById(serviceId).lean();
    if (!service) throw new NotFoundException(`Service with ID ${serviceId} not found`);

    // ===========================================
    // <-- ¡AQUÍ ESTÁ LA MODIFICACIÓN!
    // ===========================================
    const serviceDetails = await this.serviceDetailModel
      .find({ service_id: serviceId })
      .populate('photos') // <-- AÑADE ESTA LÍNEA
      .lean();

    return { service, serviceDetails };
  } catch (error) {
    throw new InternalServerErrorException(`Error fetching service: ${error.message}`);
  }
}

}
