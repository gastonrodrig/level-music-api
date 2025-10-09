import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchedule, PaymentScheduleSchema } from './schema';
import { SalesDocument, SalesDocumentSchema } from './schema';
import { SalesDocumentDetail, SalesDocumentDetailSchema } from './schema';

import { PaymentService } from './services';
import { PaymentController } from './controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentSchedule.name, schema: PaymentScheduleSchema },
      { name: SalesDocument.name, schema: SalesDocumentSchema },
      { name: SalesDocumentDetail.name, schema: SalesDocumentDetailSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
