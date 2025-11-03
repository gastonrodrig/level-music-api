import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceDetailPrice } from '../schema';
import { CreateServicesDetailsPricesDto } from '../dto';

@Injectable()
export class ServicesDetailsPricesService {
  constructor(
    @InjectModel(ServiceDetailPrice.name)
    private readonly ServiceDetailsPricesModel: Model<ServiceDetailPrice>,
  ) {}

  // ✅ Crear nuevo registro de precio
  async create(
    dto: CreateServicesDetailsPricesDto,
  ): Promise<ServiceDetailPrice> {
    try {
      if (!dto.service_detail_id) {
        throw new HttpException(
          { message: 'Debe especificar el ID del detalle de servicio.' },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Cierra el precio anterior (si aún no tiene end_date)
      await this.ServiceDetailsPricesModel.updateMany(
        {
          service_detail_id: dto.service_detail_id,
          end_date: null,
        },
        { end_date: new Date() },
      );

      // Crea el nuevo registro
      const newPrice = await this.ServiceDetailsPricesModel.create({
        service_detail_id: dto.service_detail_id,
        reference_detail_price: dto.reference_detail_price,
        start_date: dto.start_date ?? new Date(),
        end_date: dto.end_date ?? null,
      });

      return newPrice;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error al registrar el precio del servicio: ${error.message}`,
      );
    }
  }
  // ✅ Obtener precios por detalle de servicio
  async findByServiceDetailId(
    service_detail_id: string,
  ): Promise<ServiceDetailPrice[]> {
    try {
      const prices = await this.ServiceDetailsPricesModel.find({
        service_detail_id,
      });

      if (!prices || prices.length === 0) {
        throw new NotFoundException(
          `No se encontraron precios para el detalle de servicio con ID ${service_detail_id}`,
        );
      }

      return prices;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error al obtener los precios por detalle de servicio: ${error.message}`,
      );
    }
  }

  // ✅ Paginación general (por si se lista todo)
  async findAllPaginated(
    limit = 5,
    offset = 0,
    sortField = 'start_date',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ total: number; items: ServiceDetailPrice[] }> {
    try {
      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.ServiceDetailsPricesModel.find()
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.ServiceDetailsPricesModel.countDocuments().exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al listar precios con paginación: ${error.message}`,
      );
    }
  }
}
