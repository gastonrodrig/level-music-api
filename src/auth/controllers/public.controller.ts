import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivationToken } from 'src/auth/schema';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('')
export class PublicController {
  constructor(
    @InjectQueue('activation-clicks') private readonly clicksQ: Queue,
    @InjectModel(ActivationToken.name) private readonly tokenModel: Model<ActivationToken>,
  ) {}

  @Get('t/:token')
  @Public()
  @ApiOperation({ summary: 'Activar cuenta de usuario' })
  @ApiQuery({ name: 'token', type: String,  })
  async onMailButtonClick(@Param('token') token: string) {
    // Buscar token
    const doc = await this.tokenModel.findOne({ token }).lean();
    if (!doc) {
      return { 
        success: false, 
        used: null, 
        message: 'Token no encontrado' 
      };
    }

    // Verificar expiración
    const exp = doc.expiresAt instanceof Date
      ? doc.expiresAt
      : new Date(doc.expiresAt as any);
    if (exp.getTime() < Date.now()) {
      return { 
        success: false, 
        used: null, 
        message: 'Token expirado' 
      };
    }

    // Fue usado?
    if (doc.used) {
      return { 
        success: false,
        used: true, 
        message: 'Ya lo usaste' 
      };
    }

    // Agregar job para procesar la activación
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

    // Retornar éxito
    return { 
      success: true, 
      used: false, 
      message: 'Procesando activación' 
    };
  }
}
