// src/modules/mail/processor/quotation-ready.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../service';

@Processor('quotation-ready')
export class QuotationReadyProcessor extends WorkerHost {
  private readonly logger = new Logger(QuotationReadyProcessor.name);
  constructor(private readonly mailService: MailService) { super(); }

  async process(job: Job<any>): Promise<void> {
    const { to, activationUrl, clientName } = job.data;
    this.logger.log(`Sending quotation-ready to ${to}`);
    await this.mailService.sendQuotationReadyMail({ to, activationUrl, clientName });
  }
}
