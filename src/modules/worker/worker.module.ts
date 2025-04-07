import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker_type, Worker_typeSchema } from './schema/worker-type.schema';
import { WorkerTypeService } from './services/worker-type.service';
import { WorkerTypeController } from './controllers/worker-type.controller';
import { Worker, WorkerSchema } from './schema/worker.schema';
import { WorkerService } from './services/worker.service';
import { WorkerController } from './controllers/worker.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Worker_type.name, schema: Worker_typeSchema },
      { name: Worker.name, schema: WorkerSchema }
    ])
  ],
  providers: [WorkerTypeService, WorkerService],
  controllers: [WorkerTypeController, WorkerController],
})
export class WorkerModule {}
