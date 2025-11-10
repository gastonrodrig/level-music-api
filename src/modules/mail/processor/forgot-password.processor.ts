import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../service';

@Processor('forgot-password')
export class ForgotPasswordProcessor extends WorkerHost {
	constructor(private readonly mailService: MailService) {
		super();
	}

	async process(job: Job<any>): Promise<any> {
		const { data, to } = job.data;

		await this.mailService.sendPasswordResetLink({
			to,
			link: data.link,
		});
		
		return { status: 'sent', to };
	}
}