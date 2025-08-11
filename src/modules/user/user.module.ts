import { Module } from '@nestjs/common';
import { UserService } from './services';
import { UserController } from './controllers';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { User, UserSchema } from './schema';
import { FirebaseModule } from 'src/modules/firebase/firebase.module';
import { MailModule } from 'src/modules/mail/mail.module';
import { addUserHooks } from './hooks';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from '../worker/schema';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
    MongooseModule.forFeature([
      { name: Worker.name, schema: WorkerSchema },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: (connection: Connection) => {
          addUserHooks(UserSchema, connection);
          return UserSchema;
        },
        inject: [getConnectionToken()],
      }
    ]),
    FirebaseModule,
    MailModule,
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
