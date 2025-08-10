import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Provider } from '../schema';
import { Model } from 'mongoose';
import { CreateProviderDto, UpdateProviderDto } from '../dto';
import { SF_PROVIDER } from 'src/core/utils';
import { errorCodes } from 'src/core/common';

@Injectable()
export class ProviderService {
  constructor(
    @InjectModel(Provider.name)
    private providerModel: Model<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    try {
      // Validar nombre de contacto y correo electrónico únicos
      const [existingContactName, existingEmail] = await Promise.all([
        this.providerModel.findOne({
          contact_name: createProviderDto.contact_name,
        }),
        this.providerModel.findOne({ email: createProviderDto.email }),
      ]);

      if (existingContactName) {
        throw new HttpException(
          {
            code: errorCodes.CONTACT_NAME_ALREADY_EXISTS,
            message: 'El nombre de contacto ya fue registrado previamente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingEmail) {
        throw new HttpException(
          {
            code: errorCodes.EMAIL_ALREADY_EXISTS,
            message: 'El correo ya fue registrado previamnente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const provider = await this.providerModel.create(createProviderDto);
      return await provider.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error creating provider: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Provider[] }> {
    try {
      const filter = search
        ? {
            $or: SF_PROVIDER.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.providerModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.providerModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding providers with pagination: ${error.message}`,
      );
    }
  }

  async findOne(provider_id: string): Promise<Provider> {
    try {
      const provider = await this.providerModel.findOne({ _id: provider_id });
      if (!provider) {
        throw new NotFoundException(
          `Provider with ID '${provider_id}' not found`,
        );
      }
      return provider;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error finding provider: ${error.message}`,
      );
    }
  }

  async update(
    provider_id: string,
    updateProviderDto: UpdateProviderDto,
  ): Promise<Provider> {
    try {
      // Validar nombre de contacto y correo electrónico únicos
      const [existingContactName, existingEmail] = await Promise.all([
        this.providerModel.findOne({
          contact_name: updateProviderDto.contact_name,
          _id: { $ne: provider_id },
        }),
        this.providerModel.findOne({
          email: updateProviderDto.email,
          _id: { $ne: provider_id },
        }),
      ]);

      if (existingContactName) {
        throw new HttpException(
          {
            code: errorCodes.CONTACT_NAME_ALREADY_EXISTS,
            message: 'El nombre de contacto ya fue registrado previamente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingEmail) {
        throw new HttpException(
          {
            code: errorCodes.EMAIL_ALREADY_EXISTS,
            message: 'El correo ya fue registrado previamnente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Actualizar el proveedor
      const updatedProvider = await this.providerModel
        .findOneAndUpdate({ _id: provider_id }, updateProviderDto, {
          new: true,
        })
        .exec();

      // Si no se encontro, lanzar una excepción
      if (!updatedProvider)
        throw new BadRequestException(
          `Provider with ID ${provider_id} not found`,
        );

      return updatedProvider;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error updating provider: ${error.message}`,
      );
    }
  }
}
