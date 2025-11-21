import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../service';

@Processor('temporal-credentials')
export class TemporalCredentialsProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { to, email, password } = job.data;

    await this.mailService.sendTemporalCredentials({
      to,
      email,
      password,
    });

    return { status: 'sent', to: job.data.to };
  }
}
