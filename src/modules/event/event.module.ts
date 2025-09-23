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
  IncidentSchema,
  Assignation,
  AssignationSchema,
  ReprogramingsSchema,
  Reprogramings
} from './schema';
import { 
  EventService, 
  EventTypeService, 
  EventTaskService, 
  FeaturedEventService,
  IncidentService, 
  AssignationsService,
  ReprogramingsService
} from './services';
import { 
  EventController, 
  EventTypeController, 
  EventTaskController, 
  FeaturedEventController,
  IncidentController,
  AssignationsController,
  ReprogramingsController
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
import { ServiceModule } from '../service/service.module';

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
        { name: Assignation.name, schema: AssignationSchema },
        { name: Reprogramings.name, schema: ReprogramingsSchema },
        ]);
    })(),
    FirebaseModule,
    EquipmentModule,
    WorkerModule,
    ServiceModule
  ],
  providers: [
    EventService, 
    EventTypeService, 
    EventTaskService, 
    FeaturedEventService,
    ReprogramingsService,
    FeaturedEventService,
    IncidentService, 
    AssignationsService
  ],
  controllers: [
    EventController, 
    EventTypeController, 
    EventTaskController, 
    FeaturedEventController,
    ReprogramingsController,
    IncidentController,
    AssignationsController,
  ], 
})
export class EventModule {}
