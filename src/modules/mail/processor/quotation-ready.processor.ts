import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../service';

@Processor('quotation-ready')
export class QuotationReadyProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    const { to, clientName } = job.data;

    await this.mailService.sendQuotationReadyMail({
      to,
      clientName,
    });
  }
}
