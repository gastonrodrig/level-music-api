import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../service';

@Processor('purchase-order')
export class PurchaseOrderProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { to, providerName, event, assignations } = job.data;

    await this.mailService.sendPurchaseOrderPdf({
      to,
      providerName,
      providerCompany: assignations[0]?.service_provider_name,
      event,
      assignations,
    });

    return { status: 'sent', to };
  }
}
