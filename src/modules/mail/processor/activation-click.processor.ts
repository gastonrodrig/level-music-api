import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { MailService } from '../service';
import { AuthService } from 'src/modules/firebase/services';
import { ActivationTokenService } from 'src/auth/services';
import { User } from 'src/modules/user/schema';
import { generateRandomPassword } from 'src/core/utils';
import { Estado, Roles } from 'src/core/constants/app.constants';
import { StatusType } from 'src/modules/event/enum';
import { Event } from 'src/modules/event/schema';

@Processor('activation-clicks')
export class ActivationClickProcessor extends WorkerHost {
  private readonly logger = new Logger(ActivationClickProcessor.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly activationTokenService: ActivationTokenService,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
  ) {
    super();
  }

  async process(job: Job<{ token: string }>): Promise<void> {
    const { token } = job.data;
    this.logger.log(`🟡 Procesando click de activación (JobID=${job.id})`);

    try {
      // 1️⃣ Validar token y obtener datos
      const payload = await this.activationTokenService.validateToken(token);
      if (!payload) {
        this.logger.warn(`⚠️ Token inválido o expirado: ${token}`);
        return;
      }

      const { email, event } = payload;

      // 🔒 Marcar token como usado al inicio (evita reprocesamientos)
      await this.activationTokenService.markUsed(token);

      // 2️⃣ Verificar si el usuario ya existe (idempotencia)
      const existing = await this.userModel.findOne({ email }).lean();
      if (existing) {
        this.logger.log(`ℹ️ Usuario ya existe: ${email}. No se recrea.`);
        // Puedes actualizar estado del evento si corresponde
        await this.eventModel.findByIdAndUpdate(event, { status: StatusType.REVISION_CLIENTE });
        return;
      }

      // 3️⃣ Crear usuario en Firebase con contraseña temporal
      const password = generateRandomPassword();
      const fb = await this.authService.createUserWithEmail({ email, password });

      if (!fb.success || !fb.uid) {
        throw new Error(fb.message || 'Error al crear usuario en Firebase');
      }

      // 4️⃣ Crear usuario temporal en Mongo
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

      // 5️⃣ Actualizar estado del evento
      await this.eventModel.findByIdAndUpdate(event, {
        status: StatusType.REVISION_CLIENTE,
      });

      // 6️⃣ Enviar credenciales por correo
      await this.mailService.sendTemporalCredentials({ to: email, email, password });

      this.logger.log(`✅ Cuenta temporal creada y credenciales enviadas a ${email}`);
    } catch (err: any) {
      this.logger.error(`❌ Error procesando token: ${err?.message || err}`);
      throw err;
    }
  }
}
