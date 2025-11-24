import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../service';

@Processor('quotation-ready')
export class QuotationReadyProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { to } = job.data;

    await this.mailService.sendQuotationReadyMail(to);

    return { status: 'sent', to };
  }
}
