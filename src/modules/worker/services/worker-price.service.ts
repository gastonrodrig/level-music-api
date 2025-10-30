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
      // Verificar que el trabajador exista
      const worker = await this.workerModel.findById(dto.worker_id);
      if (!worker) {
        throw new NotFoundException('Trabajador no encontrado');
      }

      // fecha de inicio para start_date
      const start_date = worker.last_price_updated_at;

      // fecha actual para end_date
      const now = new Date(); 

      // Actualizar worker
      const updatedWorker = await this.workerModel.findByIdAndUpdate(
        dto.worker_id,
        {
          $set: {
            reference_price: dto.reference_price,
            last_price_updated_at: now,
          },
          $inc: { season_number: 1 }, // Incrementar season_number
        },
        { new: true },
      );

      if (!updatedWorker) {
        throw new InternalServerErrorException('No se pudo actualizar el trabajador');
      }

      // season_number según la versión actualizada del trabajador
      const season_number = updatedWorker.season_number;

      // Crear nuevo registro en worker_prices
      const newPrice = new this.workerPriceModel({
        worker: updatedWorker._id,
        reference_price: dto.reference_price,
        start_date,
        end_date: now,
        season_number,
      });

      return await newPrice.save();
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
        [sortField]: sortOrder === 'asc' ? 1 : -1,
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
