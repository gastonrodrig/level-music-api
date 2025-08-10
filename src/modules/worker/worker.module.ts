import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { 
  Worker,
  WorkerType,
  WorkerSchema,
  WorkerTypeSchema,
} from './schema';
import {
  WorkerService,
  WorkerTypeService,
} from './services';
import {
  WorkerController,
  WorkerTypeController,
} from './controllers';
import { 
  addWorkerHooks, 
  addWorkerTypeHooks 
} from './hooks';
import { User, UserSchema } from '../user/schema';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AuthService } from '../firebase/services';
import { FirebaseModule } from '../firebase/firebase.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: WorkerType.name,
        useFactory: (connection: Connection) => {
          addWorkerTypeHooks(WorkerTypeSchema, connection);
          return WorkerTypeSchema;
        },
        inject: [getConnectionToken()],
      },
      {
        name: Worker.name,
        useFactory: (connection: Connection) => {
          addWorkerHooks(WorkerSchema, connection);
          return WorkerSchema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    FirebaseModule,
    MailModule
  ],
  providers: [WorkerTypeService, WorkerService],
  controllers: [WorkerTypeController, WorkerController],
})
export class WorkerModule {}
