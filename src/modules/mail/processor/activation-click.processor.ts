import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../service';
import { InjectModel } from '@nestjs/mongoose';
import { AuthService } from 'src/modules/firebase/services';
import { User } from 'src/modules/user/schema';
import { Model } from 'mongoose';
import { generateRandomPassword } from 'src/core/utils';
import { Estado, Roles } from 'src/core/constants/app.constants';

@Processor('activation-clicks')
export class ActivationClickProcessor extends WorkerHost {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) { super(); }

  async process(job: Job<{ email: string }>): Promise<void> {
    const { email } = job.data;

    // Idempotencia: si ya existe, no crear de nuevo
    const existing = await this.userModel.findOne({ email }).lean();
    if (existing) return;

    // Crear en Firebase con password temporal
    const password = generateRandomPassword();
    const fb = await this.authService.createUserWithEmail({ email, password });
    if (!fb.success || !fb.uid) throw new Error(fb.message || 'Firebase create failed');

    // Crear en Mongo marcando temporal
    await this.userModel.create({
      email,
      auth_id: fb.uid,
      role: Roles.CLIENTE,
      status: Estado.ACTIVO,
      created_by_admin: false,
      needs_password_change: false,
      is_extra_data_completed: true,
      is_temp_account: true,
    });

    // Enviar credenciales por correo
    await this.mailService.sendTemporalCredentials({ to: email, email, password });
  }
}
