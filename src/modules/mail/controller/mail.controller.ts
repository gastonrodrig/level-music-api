import { Controller, Body, Post } from '@nestjs/common';
import { MailService } from '../service/mail.service';
import { CreateMailDto } from '../dto/create-mail.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';

@ApiTags('Mail - Gmail Api')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-test-email')
  @Public()
  async sendTestEmail(
    @Body() createMailDto: CreateMailDto,
  ) {
    const result = await this.mailService.sendTestEmail(createMailDto);
    return { message: `Correo de prueba enviado satisfactoriamente`, result };
  }
}
