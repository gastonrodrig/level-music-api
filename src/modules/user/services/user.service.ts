import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { SF_USER } from 'src/core/utils/searchable-fields';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new BadRequestException('El usuario ya existe');
      }

      const user = await this.userModel.create(createUserDto);
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async findAllPaginated(
      limit = 5,
      offset = 0,
      search = '',
      sortField: string,
      sortOrder: 'asc' | 'desc' = 'asc',
    ): Promise<{ total: number; items: User[] }> {
      try {
        // Notas:
        // 1) se filtra por nombre o descripción (Campos de la tabla)
        const filter = search
        ? {
            $or: SF_USER.map(field => ({
              [field]: { $regex: search, $options: 'i' }
            })),
          }
        : {};
  
        // 2) se ordena por el campo que se pasa por parámetro (Ascendente o Descendente)
        const sortObj: Record<string, 1 | -1> = {
          [sortField]: sortOrder === 'asc' ? 1 : -1,
        };
  
        const [items, total] = await Promise.all([
          this.userModel
            .find(filter)
            .collation({ locale: 'es', strength: 1 })
            .sort(sortObj)
            .skip(offset)
            .limit(limit)
            .exec(),
          this.userModel
            .countDocuments(filter)
            .exec(),
        ]);
  
        return { total, items };
      } catch (error) {
        throw new InternalServerErrorException(
          `Error finding users with pagination: ${error.message}`,
        );
      }
    }

  async findAllCustomersPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: User[] }> {
    try {
      // Filtrar por rol cliente y búsqueda
      const baseFilter = { role: 'Cliente' };
      const searchFilter = search
        ? {
            $or: SF_USER.map(field => ({
              [field]: { $regex: search, $options: 'i' }
            })),
          }
        : {};

      const filter = search
        ? { ...baseFilter, ...searchFilter }
        : baseFilter;

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.userModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.userModel
          .countDocuments(filter)
          .exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding customers with pagination: ${error.message}`,
      );
    }
  }

  async findOne(user_id: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ _id: user_id });
      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async update(user_id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userModel.findOne({ _id: user_id });
      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }
      Object.assign(user, updateUserDto);
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}
