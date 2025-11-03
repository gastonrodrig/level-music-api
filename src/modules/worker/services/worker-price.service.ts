import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Worker, WorkerPrice } from '../schema';
import { CreateWorkerPriceDto } from '../dto';
import { toObjectId } from 'src/core/utils';

@Injectable()
export class WorkerPriceService {
  constructor(
    @InjectModel(Worker.name)
    private workerModel: Model<Worker>,
    @InjectModel(WorkerPrice.name)
    private workerPriceModel: Model<WorkerPrice>,
  ) {}

  async updateReferencePrice(dto: CreateWorkerPriceDto): Promise<WorkerPrice> {
    try {
      const worker = await this.workerModel.findById(dto.worker_id);
      if (!worker) throw new NotFoundException('Trabajador no encontrado');

      // Obtener la fecha de inicio de la temporada actual
      const start_date =
        worker.season_number === 1
          ? new Date()
          : worker.last_price_updated_at;

      // Número de temporada actual
      const season_number = worker.season_number ?? 1;

      if (season_number !== 1) {
        const previousPrice = await this.workerPriceModel.findOne({
          worker: worker._id,
          end_date: null,
        }).sort({ created_at: -1 }).exec();

        if (previousPrice) {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
          previousPrice.end_date = yesterday;
          await previousPrice.save();
        }
      }

      // Crear un nuevo registro en WorkerPrice con la temporada anterior
      const newPrice = new this.workerPriceModel({
        worker: worker._id,
        reference_price: dto.reference_price,
        start_date,
        end_date: null,
        season_number,
      });
      await newPrice.save();

      // Luego sí actualizas el trabajador
      await this.workerModel.findByIdAndUpdate(
        dto.worker_id,
        {
          $set: {
            reference_price: dto.reference_price,
            last_price_updated_at: new Date(),
          },
          $inc: { season_number: 1 }, // recién ahora se incrementa
        },
      );

      return newPrice;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar el precio de referencia: ${error.message}`,
      );
    }
  }

  async findPricesPaginated(
    limit = 5,
    offset = 0,
    sortField: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc',
    worker_id: string,
  ): Promise<{ total: number; items: WorkerPrice[] }> {
    try {
      const filter: any = {};
      filter.worker = toObjectId(worker_id);
      
      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'desc' ? -1 : 1,
      };

      const [items, total] = await Promise.all([
        this.workerPriceModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.workerPriceModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding worker prices with pagination: ${error.message}`,
      );
    }
  }
}
