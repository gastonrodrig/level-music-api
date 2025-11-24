import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { 
  Event, 
  EventType, 
  EventTask, 
  EventSchema,
  EventSubtask,
  EventSubtaskSchema,
  EventSubtaskEvidence,
  EventSubtaskEvidenceSchema,
  EventTypeSchema, 
  EventTaskSchema, 
  FeaturedEvent,
  FeaturedEventSchema, 
  Incident, 
  IncidentSchema,
  Assignation,
  AssignationSchema,
} from './schema';
import { 
  EventService, 
  EventTypeService, 
  EventTaskService, 
  FeaturedEventService,
  IncidentService, 
  AssignationsService,
  AppointmentsService,
  TaskEvidenceService
} from './services';
import { 
  EventController, 
  EventTypeController, 
  EventTaskController, 
  FeaturedEventController,
  IncidentController,
  AssignationsController,
  AppointmentsController
} from './controllers';
import { 
  addEventHooks, 
  addEventTaskHooks, 
  addEventTypeHooks 
} from './hooks';
import {
  Worker,
  WorkerType,
  WorkerTypeSchema,
  WorkerSchema
} from 'src/modules/worker/schema';
import {
  User,
  UserSchema
} from 'src/modules/user/schema';
import { PaymentSchedule, PaymentScheduleSchema } from '../payment/schema';
import { FeaturedEventsMedia, FeaturedEventsMediaSchema } from '../uploads';
import { FirebaseModule } from '../firebase/firebase.module';
import { EquipmentModule } from '../equipments/equipment.module';
import { WorkerModule } from '../worker/worker.module';
import { ServiceModule } from '../service/service.module';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from 'src/auth/auth.module';
import { Appointment, AppointmentSchema } from './schema/appointment.schema';

@Module({
  imports: [
     BullModule.registerQueue(
      { name: 'quotation-ready' },
      { name: 'appointment-ready' },
      { name: 'purchase-order' }
    ),
    (() => {
      addEventHooks(EventSchema);
      addEventTypeHooks(EventTypeSchema);
      addEventTaskHooks(EventTaskSchema);

      return MongooseModule.forFeature([
        { name: Event.name, schema: EventSchema },
        { name: EventType.name, schema: EventTypeSchema },
        { name: EventTask.name, schema: EventTaskSchema },
        { name: EventSubtask.name, schema: EventSubtaskSchema },
        { name: EventSubtaskEvidence.name, schema: EventSubtaskEvidenceSchema },
        { name: Worker.name, schema: WorkerSchema },
        { name: WorkerType.name, schema: WorkerTypeSchema },
        { name: User.name, schema: UserSchema },
        { name: FeaturedEvent.name, schema: FeaturedEventSchema },
        { name: FeaturedEventsMedia.name, schema: FeaturedEventsMediaSchema },
        { name: Incident.name, schema: IncidentSchema },
        { name: Assignation.name, schema: AssignationSchema },
        { name: PaymentSchedule.name, schema: PaymentScheduleSchema },
        { name: Appointment.name, schema: AppointmentSchema },
        ]);
    })(),
    FirebaseModule,
    EquipmentModule,
    WorkerModule,
    ServiceModule,
    AuthModule,
  ],
  providers: [
    EventService, 
    EventTypeService, 
    EventTaskService, 
    TaskEvidenceService,
    FeaturedEventService,
    FeaturedEventService,
    IncidentService, 
    AssignationsService,
    AppointmentsService
  ],
  controllers: [
    EventController, 
    EventTypeController, 
    EventTaskController, 
    FeaturedEventController,
    IncidentController,
    AssignationsController,
    AppointmentsController
  ], 
})
export class EventModule {}
