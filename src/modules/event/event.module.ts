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
  Incident, 
  IncidentSchema
} from './schema';
import { 
  EventService, 
  EventTypeService, 
  EventTaskService, 
  FeaturedEventService,
  IncidentService 
} from './services';
import { 
  EventController, 
  EventTypeController, 
  EventTaskController, 
  FeaturedEventController,
  IncidentController
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
import { EquipmentModule } from '../equipments/equipment.module';
import { WorkerModule } from '../worker/worker.module';

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
        { name: Incident.name, schema: IncidentSchema },
      ]);
    })(),
    FirebaseModule,
    EquipmentModule,
    WorkerModule
  ],
  providers: [
    EventService, 
    EventTypeService, 
    EventTaskService, 
    FeaturedEventService,
    IncidentService,
  ],
  controllers: [
    EventController, 
    EventTypeController, 
    EventTaskController, 
    FeaturedEventController,
    IncidentController
  ], 
})
export class EventModule {}
