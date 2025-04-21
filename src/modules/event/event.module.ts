import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schema/event.schema';
import { EventService } from './services/event.service';
import { EventController } from './controllers/event.controller';
import { EventType,EventTypeSchema } from './schema/event_type.schema';
import { EventTypeService } from './services/event-type.service';
import { EventTypeController } from './controllers/event-type.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: EventType.name, schema: EventTypeSchema }, 
    ]),
  ],
  providers: [EventService, EventTypeService],
    controllers: [EventController, EventTypeController], 
})

export class EventModule {}