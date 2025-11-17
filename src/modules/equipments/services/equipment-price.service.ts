import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipment, EquipmentPrice } from '../schema';
import { CreateEquipmentPriceDto } from '../dto';
import { toObjectId } from 'src/core/utils';

@Injectable()
export class EquipmentPriceService {
  constructor(
    @InjectModel(Equipment.name)
    private equipmentModel: Model<Equipment>,
    @InjectModel(EquipmentPrice.name)
    private equipmentPriceModel: Model<EquipmentPrice>,
  ) {}

  async updateReferencePrice(dto: CreateEquipmentPriceDto): Promise<EquipmentPrice> {
    try {
      const equipment = await this.equipmentModel.findById(dto.equipment_id);
      if (!equipment) throw new NotFoundException('Equipo no encontrado');

      // Obtener la fecha de inicio de la temporada actual
      const start_date = new Date();

      // Número de temporada actual
      const season_number = equipment.season_number ?? 1;

      if (season_number !== 1) {
        const previousPrice = await this.equipmentPriceModel.findOne({
          equipment: equipment._id,
          end_date: null,
        }).sort({ created_at: -1 }).exec();

        if (previousPrice) {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
          previousPrice.end_date = yesterday;
          await previousPrice.save();
        }
      }

      // Crear un nuevo registro en EquipmentPrice con la temporada anterior
      const newPrice = new this.equipmentPriceModel({
        equipment: equipment._id,
        reference_price: dto.reference_price,
        start_date,
        end_date: null,
        season_number,
      });
      await newPrice.save();

      // Luego sí actualizas el equipo
      await this.equipmentModel.findByIdAndUpdate(
        dto.equipment_id,
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
    equipment_id: string,
  ): Promise<{ total: number; items: EquipmentPrice[] }> {
    try {
      const filter: any = {};
      filter.equipment = toObjectId(equipment_id);
      
      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'desc' ? -1 : 1,
      };

      const [items, total] = await Promise.all([
        this.equipmentPriceModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.equipmentPriceModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding equipment prices with pagination: ${error.message}`,
      );
    }
  }
}
