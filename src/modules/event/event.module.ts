import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { 
  Event, 
  EventType, 
  EventTask, 
  ActivityTemplate, 
  EventSchema, 
  EventTypeSchema, 
  EventTaskSchema, 
  ActivityTemplateSchema, 
} from './schema';
import { 
  ActivityTemplateService, 
  EventService, 
  EventTypeService, 
  EventTaskService 
} from './services';
import { 
  EventController, 
  EventTypeController, 
  EventTaskController, 
  ActivityTemplateController 
} from './controllers';
import { 
  addActivityTemplateHooks, 
  addEventHooks, 
  addEventTaskHooks, 
  addEventTypeHooks 
} from './hooks';
import {
  WorkerType,
  WorkerTypeSchema
} from 'src/modules/worker/schema';
import {
  User,
  UserSchema
} from 'src/modules/user/schema';

@Module({
  imports: [
    (() => {
      addEventHooks(EventSchema);
      addEventTypeHooks(EventTypeSchema);
      addActivityTemplateHooks(ActivityTemplateSchema);
      addEventTaskHooks(EventTaskSchema);

      return MongooseModule.forFeature([
        { name: Event.name, schema: EventSchema },
        { name: EventType.name, schema: EventTypeSchema },
        { name: EventTask.name, schema: EventTaskSchema },
        { name: ActivityTemplate.name, schema: ActivityTemplateSchema },
        { name: WorkerType.name, schema: WorkerTypeSchema },
        { name: User.name, schema: UserSchema },
      ]);
    })(),
  ],
  providers: [
    EventService, 
    EventTypeService, 
    EventTaskService, 
    ActivityTemplateService
  ],
  controllers: [
    EventController, 
    EventTypeController, 
    EventTaskController, 
    ActivityTemplateController
  ], 
})
export class EventModule {}
