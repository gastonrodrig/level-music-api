// src/auth/controllers/public.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivationToken } from 'src/auth/schema';

@Controller('')
export class PublicController {
  constructor(
    @InjectQueue('activation-clicks') private readonly clicksQ: Queue,
    @InjectModel(ActivationToken.name) private readonly tokenModel: Model<ActivationToken>,
  ) {}

  @Public()
  @Get('t/:token')
  async onMailButtonClick(@Param('token') token: string) {
    // 1) Leer el token SIN lanzar excepciones
    const doc = await this.tokenModel.findOne({ token }).lean();
    if (!doc) {
      return { success: false, used: null, message: 'Token no encontrado' };
    }

    // Normaliza fecha con lean()
    const exp = doc.expiresAt instanceof Date ? doc.expiresAt : new Date(doc.expiresAt as any);
    const expired = exp.getTime() < Date.now();
    if (expired) {
      return { success: false, used: null, message: 'Token expirado' };
    }

    // 2) Si ya fue usado → DEVOLVER ERROR (como pediste)
    if (doc.used) {
      return { success: false, used: true, message: 'Ya lo usaste' };
      // (si quieres exactamente used:null, cambia a used: null)
    }

    // 3) Aún no usado → encola job una sola vez
    const jobId = `activation-${token}`;
    const existing = await this.clicksQ.getJob(jobId);
    if (!existing) {
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
    }

    // 4) Respuesta OK (primera vez)
    return { success: true, used: false, message: 'Procesando activación…' };
  }
}
