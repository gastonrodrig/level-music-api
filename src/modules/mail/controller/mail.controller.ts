import { Controller, Body, Post, Patch, Param } from '@nestjs/common';
import { MailService } from '../service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { 
  CreateTemporalCredentialMailDto, 
  CreateContactMailDto,
} from '../dto';

@ApiTags('Mail - Gmail Api')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

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
  async sendContactMail(
    @Body() createContactMailDto: CreateContactMailDto
  ) {
    const result = await this.mailService.sendContactMail(createContactMailDto);
    return { message: `Correo de contacto enviado satisfactoriamente`, result };
  }
}

