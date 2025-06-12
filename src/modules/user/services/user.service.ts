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
      const [existingUser, existingDocumentNumber] = await Promise.all([
        this.userModel.findOne({ email: createUserDto.email }),
        this.userModel.findOne({ document_number: createUserDto.document_number }),
      ]);

      if (existingUser) {
        throw new BadRequestException('ERROR-001');
      }
      
      if(createUserDto.created_by_admin) { 
        if (existingDocumentNumber) {
          throw new BadRequestException('ERROR-002');
        }
      }

      const user = await this.userModel.create(createUserDto);
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
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
      // Filtro base (solo clientes)
      const baseFilter = { role: 'Cliente' };

      // Filtro de búsqueda (si hay search)
      const searchFilter = search
        ? {
            $or: SF_USER.map(field => ({
              [field]: { $regex: search, $options: 'i' }
            })),
          }
        : {};

      // Filtro de campos obligatorios completos
      const completeFieldsFilter = {
        first_name: { $nin: [null, ''] },
        last_name: { $nin: [null, ''] },
        phone: { $nin: [null, ''] },
        document_type: { $nin: [null, ''] },
        document_number: { $nin: [null, ''] },
      };

      // Unimos todos los filtros usando $and
      const filters: any[] = [
        baseFilter,
        completeFieldsFilter,
      ];

      if (search) {
        filters.push(searchFilter);
      }

      const finalFilter = { $and: filters };

      // Sort
      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      // Query paginada
      const [items, total] = await Promise.all([
        this.userModel
          .find(finalFilter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.userModel
          .countDocuments(finalFilter)
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

      const [existingUser, existingDocumentNumber] = await Promise.all([
        this.userModel.findOne({ email: updateUserDto.email, _id: { $ne: user_id } }),
        this.userModel.findOne({ document_number: updateUserDto.document_number, _id: { $ne: user_id } }),
      ]);

      if (existingUser) {
        throw new BadRequestException('ERROR-001');
      }
      if (existingDocumentNumber) {
        throw new BadRequestException('ERROR-002');
      }

      Object.assign(user, updateUserDto);
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async resetPasswordChangeFlag(uid: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ auth_id: uid });
      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      user.needs_password_change = false;
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}
