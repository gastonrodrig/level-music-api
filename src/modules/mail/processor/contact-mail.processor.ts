import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../service';

@Processor('contact-mail')
export class ContactMailProcessor extends WorkerHost {
  private readonly logger = new Logger(ContactMailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.log(
      `Processing contact mail job ${job.id} from ${job.data.from} to ${job.data.to}`,
    );

    try {
      await this.mailService.sendContactMail({
        from: job.data.from,   // correo cliente
        to: job.data.to,       // correo empresa
        name: job.data.name,
        message: job.data.message,
      });

      this.logger.log(
        `Contact mail sent successfully from ${job.data.from} to ${job.data.to}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send contact mail from ${job.data.from} to ${job.data.to}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
