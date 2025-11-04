import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../service';

@Processor('appointment-ready')
export class AppointmentReadyProcessor extends WorkerHost {
  private readonly logger = new Logger(AppointmentReadyProcessor.name);
  
constructor(private readonly mailService: MailService) {
  super();
  this.logger.log('AppointmentReadyProcessor initialized');
}

  async process(job: Job<any>): Promise<void> {
    const { to, clientName, meetingType, date, hour, attendeesCount } = job.data;

    this.logger.log(
      `Sending appointment-ready to ${to} | Type: ${meetingType} | Date: ${date}`
    );

    await this.mailService.sendAppointmentReadyMail({
      to,
      clientName,
      meetingType,
      date,
      hour,
      attendeesCount,
    });

    this.logger.log(`Appointment confirmation mail sent successfully to ${to}`);
  }
}