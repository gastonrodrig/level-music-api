import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schema/event.schema';
import { EventService } from './services/event.service';
import { EventController } from './controllers/event.controller';
import { EventType,EventTypeSchema } from './schema/event-type.schema';
import { EventTypeService } from './services/event-type.service';
import { EventTypeController } from './controllers/event-type.controller';
import { EventTask, EventTaskSchema } from './schema/event-task.schema';
import { ActivityTemplate, ActivityTemplateSchema } from './schema/activity-template.schema';
import { EventTaskController } from './controllers/event-task.controller';
import { ActivityTemplateController } from './controllers/activity-template.controller';
import { EventTaskService } from './services/event-task.service';
import { ActivityTemplateService } from './services/activity-template.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: EventType.name, schema: EventTypeSchema }, 
      { name: EventTask.name, schema: EventTaskSchema }, 
      { name: ActivityTemplate.name, schema: ActivityTemplateSchema }, 
    ]),
  ],
  providers: [EventService, EventTypeService, EventTaskService, ActivityTemplateService],
  controllers: [EventController, EventTypeController, EventTaskController, ActivityTemplateController], 
})

export class EventModule {}