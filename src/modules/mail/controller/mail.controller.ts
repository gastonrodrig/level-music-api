import { Controller, Body, Post } from '@nestjs/common';
import { MailService } from '../service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { 
  CreateTemporalCredentialMailDto, 
  SendQuotationReadyMailDto,
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
    const result = await this.mailService.sendTemporalCredentials(
      createTemporalCredentialDto
    );
    return {
      message: `Correo de credenciales temporales enviado satisfactoriamente`,
      result,
    };
  }
}
