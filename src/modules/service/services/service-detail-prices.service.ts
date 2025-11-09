import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceDetail, ServiceDetailPrice } from '../schema';
import { toObjectId } from 'src/core/utils/mongo-utils';

@Injectable()
export class ServicesDetailsPricesService {
  constructor(
    @InjectModel(ServiceDetail.name)
    private serviceDetailModel: Model<ServiceDetail>,
    @InjectModel(ServiceDetailPrice.name)
    private serviceDetailPricesModel: Model<ServiceDetailPrice>,
  ) {}

  async saveReferencePrice(
    service_detail_id: any,
    reference_detail_price: number
  ): Promise<ServiceDetailPrice | null> {
    try {
      const serviceDetail = await this.serviceDetailModel.findById(service_detail_id);
      if (!serviceDetail) throw new NotFoundException('Detalle de servicio no encontrado');

      // Buscar el último precio registrado para este detalle
      const lastPrice = await this.serviceDetailPricesModel
        .findOne({ service_detail_id: serviceDetail._id })
        .sort({ start_date: -1 })
        .exec();

      // Si no hay precios previos, es la primera temporada
      const season_number = lastPrice ? lastPrice.season_number + 1 : 1;

      // Verificar si el precio cambió
      if (lastPrice && lastPrice.reference_price === reference_detail_price) {
        // No se crea nuevo registro si el precio es igual
        return null;
      }

      // Si había un precio anterior activo, cerrarlo
      if (lastPrice && !lastPrice.end_date) {
        lastPrice.end_date = new Date(Date.now() - 24 * 60 * 60 * 1000); // ayer
        await lastPrice.save();
      }

      // Crear el nuevo registro solo si el precio cambió
      const newPrice = new this.serviceDetailPricesModel({
        service_detail_id: serviceDetail._id,
        reference_price: reference_detail_price,
        start_date: new Date(),
        end_date: null,
        season_number,
      });

      await newPrice.save();

      // Actualizar los campos del detalle de servicio
      await this.serviceDetailModel.findByIdAndUpdate(service_detail_id, {
        $set: {
          ref_price: reference_detail_price,
          last_price_updated_at: new Date(),
          season_number,
        },
      });

      return newPrice;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al guardar el precio de referencia: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    sortField = 'start_date',
    sortOrder: 'asc' | 'desc' = 'desc',
    service_detail_id?: string,
  ): Promise<{ total: number; items: ServiceDetailPrice[] }> {
    try {
      const filter: any = {};
      filter.service_detail_id = toObjectId(service_detail_id);

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'desc' ? -1 : 1,
      };

      const [items, total] = await Promise.all([
        this.serviceDetailPricesModel.find()
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.serviceDetailPricesModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al listar precios con paginación: ${error.message}`,
      );
    }
  }
}
