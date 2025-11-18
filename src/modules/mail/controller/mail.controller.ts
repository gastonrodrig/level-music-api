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

  @Post('send-quotation-ready')
  @Public()
  async sendQuotationReadyMail(
    @Body() dto: SendQuotationReadyMailDto,
  ) {
    const result = await this.mailService.sendQuotationReadyMail(dto);
    return {
      message: `Correo de cotización lista enviado satisfactoriamente`,
      result,
    };
  }
}
