// src/modules/auth/services/activation-token.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { ActivationToken } from '../schema';
import * as crypto from 'crypto';
import { toObjectId } from 'src/core/utils/mongo-utils';
import { Event } from 'src/modules/event/schema';
import { User } from 'src/modules/user/schema';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ActivationTokenService {
  constructor(
    @InjectModel(ActivationToken.name)
    private readonly tokenModel: Model<ActivationToken>,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectQueue('activation-clicks')
    private readonly activationClicksQ: Queue,
  ) {}

  async issueToken(params: {
    email: string;
    eventId: string;
    ttlMs?: number;
    session?: ClientSession;
  }): Promise<{ token: string; expiresAt: Date }> {
    const { email, eventId, ttlMs = 24 * 60 * 60 * 1000, session } = params;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + ttlMs);

    await this.tokenModel.create(
      [{ email, event: toObjectId(eventId), token, expiresAt, used: false }],
      { session },
    );

    return { token, expiresAt };
  }

  async validateToken(token: string) {
    const doc = await this.tokenModel.findOne({ token }).lean();
    if (!doc) throw new BadRequestException('Token inválido');
    if ((doc as any).used) throw new BadRequestException('Token ya usado');
    if (doc.expiresAt.getTime() < Date.now())
      throw new BadRequestException('Token expirado');
    return doc;
  }

  async markUsed(token: string) {
    const res = await this.tokenModel.updateOne(
      { token, used: false },
      { $set: { used: true } },
    );
    return res.modifiedCount > 0;
  }

  /**
   * Maneja el CLICK del botón del correo:
   * - Lee email desde event.client_info.email
   * - Si el usuario ya existe: marca usado y devuelve URL de login con aviso
   * - Si NO existe: marca usado, encola job para crear y mandar credenciales,
   *   y devuelve URL de "te enviaremos credenciales"
   */
  async handleMailClickAndGetRedirect(token: string, frontendUrl: string) {
    // 1) Token válido (NO lo consumimos aún)
    const tok = await this.validateToken(token);

    // 2) Email desde el EVENTO
    const ev = await this.eventModel.findById(tok.event, 'client_info.email').lean();
    const email = (ev as any)?.client_info?.email as string | undefined;
    if (!email) {
      await this.markUsed(token); // opcional: evitar reintentos
      return `${frontendUrl}/activation?status=error`;
    }

    // 3) ¿Existe usuario? (SOLO Mongo)
    const exists = !!(await this.userModel.findOne({ email }).lean());

    if (exists) {
      // A) Ya existe → marcar usado y redirigir a login con aviso
      await this.markUsed(token);
      return `${frontendUrl}/login?notice=account-exists&email=${encodeURIComponent(email)}`;
    }

    // B) No existe → marcar usado, encolar creación y redirigir a pantalla de “en breve…”
    await this.markUsed(token);
    await this.activationClicksQ.add(
      'createAccountAndSendCreds',
      { email },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 500,
        removeOnFail: 200,
      },
    );

    return `${frontendUrl}/activation?status=sent&email=${encodeURIComponent(email)}`;
  }
}
