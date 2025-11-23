import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../service';

@Processor('appointment-ready')
export class AppointmentReadyProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { to, clientName, meetingType, date, hour, attendeesCount } = job.data;

    await this.mailService.sendAppointmentReadyMail({
      to,
      clientName,
      meetingType,
      date,
      hour,
      attendeesCount,
    });

    return { status: 'sent', to };
  }
}