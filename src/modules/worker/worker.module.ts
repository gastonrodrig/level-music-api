import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker_type, Worker_typeSchema } from './schema/worker.schema';
import { WorkerTypeService } from './services/worker-type.service';
import { WorkerTypeController } from './controllers/worker.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Worker_type.name, schema: Worker_typeSchema }
    ])
  ],
  providers: [WorkerTypeService],
  controllers: [WorkerTypeController]
})
export class WorkerModule {}
