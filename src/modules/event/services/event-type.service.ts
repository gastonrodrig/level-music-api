

import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
import { CreateEventTypeDto } from '../dto/create-event_type.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventType } from '../schema/event_type.schema';

@Injectable()
export class EventTypeService {
    constructor(
        @InjectModel(EventType.name)
        private eventTypeModel: Model<EventType>,
    ) {}

    async create(createEventTypeDto: CreateEventTypeDto): Promise<EventType> {
        try {
            const eventType = await this.eventTypeModel.create(createEventTypeDto);
            return await eventType.save();
        } catch (error) {
            throw new InternalServerErrorException(
                `Error creating event type: ${error.message}`,
            );
        }
    }

    async findAll(): Promise<EventType[]> {
        try {
            return await this.eventTypeModel.find();
        } catch (error) {
            throw new InternalServerErrorException(
                `Error finding event types: ${error.message}`,
            );
        }
    }

    async findOne(event_type_id: string): Promise<EventType> {
        try {
            const eventType = await this.eventTypeModel.findOne({ _id: event_type_id });
            if (!eventType) {
                throw new BadRequestException('Tipo de evento no encontrado');
            }
            return eventType as unknown as EventType;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error finding event type: ${error.message}`,
            );
        }
    }

    async remove(event_type_id: string) {
        const user = await this.eventTypeModel.findOneAndDelete({ _id: event_type_id });
        if (!user) {
            throw new BadRequestException('Tipo de evento no encontrado');
        }
        return { success: true };
    }



}