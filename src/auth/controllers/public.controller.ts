import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller()
export class PublicController {
  constructor(@InjectQueue('activation-clicks') private clicksQ: Queue) {}

  @Public()
  @Get('t/:token')
  async onMailButtonClick(@Param('token') token: string, @Res() res: Response) {
    await this.clicksQ.add('handleActivationClick', { token }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 500,
      removeOnFail: 200,
    });
    return res.redirect(`${process.env.APP_URL}/activation?status=processing`);
  }
}