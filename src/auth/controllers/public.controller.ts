import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ApiTags } from '@nestjs/swagger';
import { ActivationTokenService } from 'src/auth/services';

@Controller('')
@ApiTags('Activation Token')
export class PublicController {
  constructor(
    @InjectQueue('activation-clicks')
    private readonly clicksQ: Queue,
    private readonly activationTokenService: ActivationTokenService,
  ) {}

  @Get('t/:token')
  @Public()
  async onMailButtonClick(@Param('token') token: string) {
    try {
      // 1️⃣ Buscar el token directamente en la base
      const tokenDoc = await this.activationTokenService.validateToken(token);

      console.log('Token doc:', tokenDoc);

      if (!tokenDoc) {
        return {
          success: false,
          used: null,
          message: 'Token no encontrado o inválido.',
        };
      }

      // 2️⃣ Si el token ya fue usado o expiró
      const isExpired = tokenDoc.expiresAt.getTime() < Date.now();
      if (tokenDoc.used || isExpired) {
        return {
          success: false,
          used: true,
          message: isExpired
            ? 'Token expirado.'
            : 'El enlace ya fue utilizado.',
        };
      }

      // 3️⃣ Crear jobId único (evita duplicar trabajos)
      const jobId = `activation-${token}`;
      const existingJob = await this.clicksQ.getJob(jobId);

      if (!existingJob) {
        await this.clicksQ.add(
          'handleActivationClick',
          { token },
          {
            jobId,
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: 200,
          },
        );
        console.log(`✅ Job creado: ${jobId}`);
      } else {
        console.log(`⚠️ Job ya existente: ${jobId}`);
      }

      // 4️⃣ Devolver al frontend info clara para decidir qué mostrar
      return {
        success: true,
        used: false,
        message: 'Token válido. Procesando activación...',
      };
    } catch (err: any) {
      console.error(`❌ Error validando token: ${err?.message || err}`);
      return {
        success: false,
        used: null,
        message: err?.message || 'Token inválido o expirado.',
      };
    }
  }
}
