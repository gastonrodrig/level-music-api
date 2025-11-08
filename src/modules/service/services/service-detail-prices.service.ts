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

  async saveReferencePrice(service_detail_id: any, reference_detail_price: number): Promise<ServiceDetailPrice> {
    try {
      const serviceDetail = await this.serviceDetailModel.findById(service_detail_id);
      if (!serviceDetail) throw new NotFoundException('Detalle de servicio no encontrado');

      // Obtener la fecha de inicio de la temporada actual
      const start_date =
        serviceDetail.season_number === 1
          ? new Date()
          : serviceDetail.last_price_updated_at;

      // Número de temporada actual
      const season_number = serviceDetail.season_number ?? 1;

      if (season_number !== 1) {
        const previousPrice = await this.serviceDetailPricesModel.findOne({
          service_detail_id: serviceDetail._id,
          end_date: null,
        }).sort({ created_at: -1 }).exec();

        if (previousPrice) {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
          previousPrice.end_date = yesterday;
          await previousPrice.save();
        }
      }

      // Crear un nuevo registro en ServiceDetailPrice con la temporada anterior
      const newPrice = new this.serviceDetailPricesModel({
        service_detail_id: serviceDetail._id,
        reference_price: reference_detail_price,
        start_date,
        end_date: null,
        season_number,
      });
      await newPrice.save();

      // Luego sí actualizas el detalle de servicio
      await this.serviceDetailModel.findByIdAndUpdate(
        service_detail_id,
        {
          $set: {
            ref_price: reference_detail_price,
            last_price_updated_at: new Date(),
          },
        },
      );

      return newPrice;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar el precio de referencia: ${error.message}`,
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
        this.serviceDetailPricesModel.countDocuments().exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al listar precios con paginación: ${error.message}`,
      );
    }
  }
}
