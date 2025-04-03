import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { Estado, Roles } from 'src/core/constants/app.constants';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        return existingUser;
      }

      const user = await this.userModel.create(createUserDto);
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error creating user: ${error.message}`);
    }
  }

  async createFromAuth(authUserData: any): Promise<User> {
    try {
      // First check if the user already exists by email
      const existingUser = await this.findByEmail(authUserData.email);
      if (existingUser) {
        // If exists, we can update Auth data if necessary
        if (authUserData.user_id && !existingUser.auth_id) {
          existingUser.auth_id = authUserData.user_id;
          await (existingUser as any).save();
        }
        
        // If the user comes from Auth0, we assume they are a natural person by default
        // This can be modified later by the user
        if (!existingUser.document_number) {
          existingUser.document_number = 'DNI'; // Default value
        }
        
        return existingUser;
      }

      // Create a new user with default values
      const newUser = new this.userModel({
        fullName: authUserData.given_name || authUserData.name,
        email: authUserData.email,
        auth_id: authUserData.user_id,
        phone: authUserData.phone || '',
        document_number: 'DNI',
        password: `auth0_user_${Math.random().toString(36).substring(2, 15)}`,
        rol: Roles.CLIENTE,
        estado: Estado.ACTIVO
      });

      return await newUser.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error creating user from Auth0: ${error.message}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find();
    } catch (error) {
      throw new InternalServerErrorException(`Error finding users: ${error.message}`);
    }
  }

  async findOne(user_id: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ uid: user_id });
      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      return user as unknown as User;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error finding user: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException(`Error finding user by email: ${error.message}`);
    }
  }

  async update(user_id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findOne({ uid: user_id });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    Object.assign(user, updateUserDto);
    return await user.save();
  }

  async remove(user_id: string) {
    const user = await this.userModel.findOneAndDelete({ _id: user_id });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return { success: true };
  }
}
