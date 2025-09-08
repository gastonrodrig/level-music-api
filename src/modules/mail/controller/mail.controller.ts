import { Controller, Body, Post } from '@nestjs/common';
import { MailService } from '../service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { CreateTemporalCredentialMailDto, CreateMailDto, CreateContactMailDto } from '../dto';

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

  @Post('send-temporal-credentials')
  @Public()
  async sendTemporalCredentials(
    @Body() createTemporalCredentialDto: CreateTemporalCredentialMailDto,
  ) {
    const result = await this.mailService.sendTemporalCredentials(createTemporalCredentialDto);
    return { message: `Correo de credenciales temporales enviado satisfactoriamente`, result };
  }

  @Post('contact')
  @Public()
  async sendContactMail(@Body() createContactMailDto: CreateContactMailDto) {
    const result = await this.mailService.sendContactMail(createContactMailDto);
    return { message: `Correo de contacto enviado satisfactoriamente`, result };
  }
}

