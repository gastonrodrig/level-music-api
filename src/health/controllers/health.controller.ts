import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/decorators';

@Controller()
export class HealthController {
  @Get('health')
  @Public()
  health() {
    return { status: 'ok' };
  }
}
