import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { ActivationToken } from '../schema';
import { toObjectId } from 'src/core/utils/mongo-utils';
import { Event } from 'src/modules/event/schema';
import { User } from 'src/modules/user/schema';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';

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

    // Asegurar Date válida aunque venga con lean()
    const exp = doc.expiresAt instanceof Date
      ? doc.expiresAt
      : new Date(doc.expiresAt as any);
    if (exp.getTime() < Date.now()) {
      throw new BadRequestException('Token expirado');
    }
    return doc;
  }

  async markUsed(token: string) {
    const res = await this.tokenModel.updateOne(
      { token, used: false },
      { $set: { used: true } },
    );
    return res.modifiedCount > 0;
  }
}
