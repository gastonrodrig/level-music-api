import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import { User } from '../schema';
import { CreateClientAdminDto, CreateClientLandingDto, UpdateClientAdminDto } from '../dto';
import { SF_USER } from 'src/core/utils';
import { generateRandomPassword } from 'src/core/utils/password-utils';
import { AuthService } from 'src/modules/firebase/services';
import { MailService } from 'src/modules/mail/service';
import { Estado, Roles } from 'src/core/constants/app.constants';
import { errorCodes } from 'src/core/common';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectQueue('temporal-credentials')
    private temporalCredentialsQueue: Queue,
    @InjectQueue('forgot-password')
    private forgotPasswordQueue: Queue,
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  async createClientLanding(createClientLandingDto: CreateClientLandingDto): Promise<User> {
    try {
      // Validar email y documento únicos
      const [existingEmail, existingDoc] = await Promise.all([
        this.userModel.findOne({ email: createClientLandingDto.email }),
        this.userModel.findOne({
          $and: [
            { document_number: createClientLandingDto.document_number },
            { document_number: { $nin: [null, ''] } }
          ]
        }),
      ]);

      if (existingEmail) {
        throw new HttpException(
          {
            code: errorCodes.EMAIL_ALREADY_EXISTS,
            message: 'El correo ya fue registrado previamnente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingDoc) {
        throw new HttpException(
          {
            code: errorCodes.DOCUMENT_NUMBER_ALREADY_EXISTS,
            message: 'El número de documento ya fue registrado previamente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Crea el usuario en la base de datos
      const user = await this.userModel.create(createClientLandingDto);
      return await user.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error creating client: ${error.message}`,
      );
    }
  }

  async createClientAdmin(
    createClientAdminDto: CreateClientAdminDto,
  ): Promise<User> {
    try {
      // Validar email y documento únicos
      const [existingEmail, existingDoc] = await Promise.all([
        this.userModel.findOne({ email: createClientAdminDto.email }),
        this.userModel.findOne({ document_number: createClientAdminDto.document_number }),
      ]);

      if (existingEmail) {
        throw new HttpException(
          {
            code: errorCodes.EMAIL_ALREADY_EXISTS,
            message: 'El correo ya fue registrado previamnente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingDoc) {
        throw new HttpException(
          {
            code: errorCodes.DOCUMENT_NUMBER_ALREADY_EXISTS,
            message: 'El número de documento ya fue registrado previamente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generar contraseña aleatoria
      const password = generateRandomPassword();

      // Crear usuario en Firebase
      const firebaseUser = await this.authService.createUserWithEmail({
        email: createClientAdminDto.email,
        password,
      });

      if (!firebaseUser.success || !firebaseUser.uid) {
        throw new InternalServerErrorException(firebaseUser.message);
      }

      // Armar datos finales con lógica de negocio
      const userToCreate = {
        ...createClientAdminDto,
        auth_id: firebaseUser.uid,
        role: Roles.CLIENTE,
        status: Estado.ACTIVO,
        created_by_admin: true,
        needs_password_change: true,
      };

      const newUser = new this.userModel(userToCreate);
      await newUser.save();

      // Encola el envío de correo con credenciales para envío en background
      await this.temporalCredentialsQueue.add('sendTemporalCredentials', {
        to: createClientAdminDto.email,
        email: createClientAdminDto.email,
        password,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 1000,
        removeOnFail: 100,
      });

      return newUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error creating client: ${error.message}`,
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
      // Filtro base (solo clientes)
      const baseFilter = { role: 'Cliente' };

      // Filtro de búsqueda (si hay search)
      const searchFilter = search
        ? {
            $or: SF_USER.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
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
      const filters: any[] = [baseFilter, completeFieldsFilter];

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
        this.userModel.countDocuments(finalFilter).exec(),
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
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
  async updateUserExtraData(user_id: string, extraData: boolean): Promise<User> {
  try {
    const user = await this.userModel.findOneAndUpdate(
      { _id: user_id },
      { extraData },
      { new: true }
    );
        if (!user) throw new BadRequestException('Usuario no encontrado');
        return user;
      } catch (error) {
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

  async updateClientAdmin(user_id: string, updateUserDto: UpdateClientAdminDto): Promise<User> {
    try {
      // Validar email y documento únicos
      const [existingEmail, existingDocumentNumber] = await Promise.all([
        this.userModel.findOne({
          email: updateUserDto.email,
          _id: { $ne: user_id },
        }),
        this.userModel.findOne({
          document_number: updateUserDto.document_number,
          _id: { $ne: user_id },
        }),
      ]);

      if (existingEmail) {
        throw new HttpException(
          {
            code: errorCodes.EMAIL_ALREADY_EXISTS,
            message: 'El correo ya fue registrado previamnente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingDocumentNumber) {
        throw new HttpException(
          {
            code: errorCodes.DOCUMENT_NUMBER_ALREADY_EXISTS,
            message: 'El número de documento ya fue registrado previamente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Actualizar usuario
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: user_id },
        updateUserDto,
        { new: true },
      );

      // Si no se encontró el usuario, lanzar excepción
      if (!updatedUser) throw new BadRequestException('Usuario no encontrado');

      // Actualizar email en Firebase
      const firebaseResponse = await this.authService.updateUserEmail(
        updatedUser.auth_id,
        { email: updateUserDto.email },
      );

      if (!firebaseResponse.success || !firebaseResponse.uid) {
        throw new InternalServerErrorException(firebaseResponse.message);
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
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

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Validar que el cliente exista
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new HttpException(
          {
            code: errorCodes.CLIENT_NOT_FOUND,
            message: 'No hay un cliente asociado a ese correo.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validar que el usuario sea un cliente
      if (user.role !== Roles.CLIENTE) {
        throw new HttpException(
          {
            code: errorCodes.USER_IS_NOT_CLIENT,
            message: 'Este correo no pertenece a un cliente.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Usar Firebase Admin SDK para generar el enlace
      const resetLink = await this.authService.generatePasswordResetLink(email);

      await this.forgotPasswordQueue.add('sendPasswordResetLink', {
        to: email,
        link: resetLink,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 1000,
        removeOnFail: 100,
      });
    } catch (error) {
      if (error.message?.includes('Unable to create the email action link')) {
        throw new HttpException(
          {
            code: errorCodes.INVALID_PROVIDER,
            message: 'Este correo está registrado con un proveedor externo. No es posible restablecer la contraseña.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Error enviando enlace de reseteo: ${error.message}`);
    }
  }
}
