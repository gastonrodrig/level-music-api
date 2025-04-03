import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from '../schema/client.schema';
import { CreateClientDto, UpdateClientDto } from '../dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(Client.name)
    private clientModel: Model<Client>
  ) {}

  async create(createClientDto: CreateClientDto) {
    const existingClient = await this.clientModel.findOne({ uid: createClientDto.uid });
    if (existingClient) {
      throw new BadRequestException('El cliente ya existe');
    }

    const client = new this.clientModel(createClientDto);
    return await client.save();
  }

  async findAll() {
    return await this.clientModel.find();
  }

  async findOne(client_uid: string) {
    const client = await this.clientModel.findOne({ uid: client_uid });
    if (!client) {
      throw new BadRequestException('Cliente no encontrado');
    }

    return client;
  }

  async update(client_uid: string, updateClientDto: UpdateClientDto) {
    const client = await this.clientModel.findOne({ uid: client_uid });
    if (!client) {
      throw new BadRequestException('Cliente no encontrado');
    }

    Object.assign(client, updateClientDto);
    return await client.save();
  }

  async remove(client_uid: string) {
    const client = await this.clientModel.findOneAndDelete({ uid: client_uid });
    if (!client) {
      throw new BadRequestException('Cliente no encontrado');
    }

    return { success: true };
  }
}
