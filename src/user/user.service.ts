import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({ uid: createUserDto.uid });
    if (existingUser) {
      throw new BadRequestException('El usuario ya existe');
    }

    const user = new this.userModel(createUserDto);
    return await user.save();
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findOne(user_uid: string) {
    const user = await this.userModel.findOne({ uid: user_uid });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return user;
  }

  async update(user_uid: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findOne({ uid: user_uid });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    Object.assign(user, updateUserDto);
    return await user.save();
  }

  async remove(user_uid: string) {
    const user = await this.userModel.findOneAndDelete({ uid: user_uid });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return { success: true };
  }
}
