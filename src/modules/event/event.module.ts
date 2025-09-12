import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { 
  Event, 
  EventType, 
  EventTask, 
  EventSchema, 
  EventTypeSchema, 
  EventTaskSchema, 
  FeaturedEvent,
  FeaturedEventSchema, 
} from './schema';
import { 
  EventService, 
  EventTypeService, 
  EventTaskService, 
  FeaturedEventService
} from './services';
import { 
  EventController, 
  EventTypeController, 
  EventTaskController, 
  FeaturedEventController
} from './controllers';
import { 
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
import { FeaturedEventsMedia, FeaturedEventsMediaSchema } from '../uploads';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    (() => {
      addEventHooks(EventSchema);
      addEventTypeHooks(EventTypeSchema);
      addEventTaskHooks(EventTaskSchema);

      return MongooseModule.forFeature([
        { name: Event.name, schema: EventSchema },
        { name: EventType.name, schema: EventTypeSchema },
        { name: EventTask.name, schema: EventTaskSchema },
        { name: WorkerType.name, schema: WorkerTypeSchema },
        { name: User.name, schema: UserSchema },
        { name: FeaturedEvent.name, schema: FeaturedEventSchema },
        { name: FeaturedEventsMedia.name, schema: FeaturedEventsMediaSchema },
      ]);
    })(),
    FirebaseModule
  ],
  providers: [
    EventService, 
    EventTypeService, 
    EventTaskService, 
    FeaturedEventService
  ],
  controllers: [
    EventController, 
    EventTypeController, 
    EventTaskController, 
    FeaturedEventController
  ], 
})
export class EventModule {}
