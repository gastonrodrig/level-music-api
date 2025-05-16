import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<CreateEventDto>
  ) {}
    
  async create(createEventDto: CreateEventDto): Promise<CreateEventDto> {
    try {
      const event = await this.eventModel.create(createEventDto);
      return await event.save();
    } catch (error) {
      throw new Error(`Error creating event: ${error.message}`);
    }
  }

  async findAll(): Promise<CreateEventDto[]> {
    try {
      return await this.eventModel.find();
    } catch (error) {
      throw new Error(`Error finding events: ${error.message}`);
    }
  }

  async findOne(event_id: string): Promise<CreateEventDto> {
    try {
      const event = await this.eventModel.findOne({ uid: event_id });
      if (!event) {
          throw new Error('Event not found');
      }
      return event as unknown as CreateEventDto;
    } catch (error) {
      throw new Error(`Error finding event: ${error.message}`);
    }
  }
}