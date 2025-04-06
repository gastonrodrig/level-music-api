import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { CreateUserDto, UpdateUserDto } from '../dto';

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
        return existingUser;
      }

      const user = await this.userModel.create(createUserDto);
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating user: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding users: ${error.message}`,
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
      throw new InternalServerErrorException(
        `Error finding user: ${error.message}`,
      );
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding user by email: ${error.message}`,
      );
    }
  }

  async update(user_id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findOne({ _id: user_id });
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
