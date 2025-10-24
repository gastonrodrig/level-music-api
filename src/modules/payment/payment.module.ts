import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Payment,
  PaymentSchedule,
  PaymentScheduleSchema,
  PaymentSchema,
} from './schema';
import { SalesDocument, SalesDocumentSchema } from './schema';
import { SalesDocumentDetail, SalesDocumentDetailSchema } from './schema';
import { Event, EventSchema } from '../event/schema';
import { PaymentService } from './services';
import { PaymentController } from './controllers';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentSchedule.name, schema: PaymentScheduleSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: SalesDocument.name, schema: SalesDocumentSchema },
      { name: SalesDocumentDetail.name, schema: SalesDocumentDetailSchema },
      { name: Event.name, schema: EventSchema },
    ]),
    FirebaseModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
