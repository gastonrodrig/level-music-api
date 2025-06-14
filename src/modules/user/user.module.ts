import { Module } from '@nestjs/common';
import { UserService } from './services';
import { UserController } from './controllers';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema';
import { addUserHooks } from './hooks';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from '../worker/schema';

@Module({
  imports: [
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
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
