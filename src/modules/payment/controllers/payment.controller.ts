import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreateManualPaymentDto, CreateMercadoPagoDto, CreatePaymentSchedulesDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear programaciones de pago (Parcial y Final)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Programaciones de pago creadas correctamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear las programaciones de pago',
  })
  async createPaymentSchedules(@Body() dto: CreatePaymentSchedulesDto) {
    return this.paymentService.createPaymentSchedules(dto);
  }

  @Post('manual')
  // @UseGuards(FirebaseAuthGuard)
  // @ApiBearerAuth('firebase-auth')
  @Public()
  @UseInterceptors(FileInterceptor('voucher'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Registrar un pago manual con comprobante adjunto' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pago manual registrado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al registrar el pago manual.' })
  @ApiQuery({
    name: 'mode',
    enum: ['partial', 'both'],
    required: true,
    description:
      'Modo de pago: "partial" para solo anticipo, "both" para pagar parcial + final.',
    example: 'partial',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event_id: { type: 'string', example: '68fa352e038345fc4290f084' },
        schedule_id: { type: 'string', example: '68fa35d1038345fc4290f10e' },
        user_id: { type: 'string', example: '68b9c17b445a8108efdf8d43' },
        payment_method: {
          type: 'string',
          enum: ['Yape', 'Plin', 'Transferencia', 'MercadoPago'],
          example: 'Yape',
        },
        amount: { type: 'number', example: 600 },
        transaction_number: {
          type: 'string',
          example: '9876543210',
        },
        voucher: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del comprobante de pago',
        },
      },
      required: [
        'event_id',
        'schedule_id',
        'user_id',
        'payment_type',
        'payment_method',
        'amount',
        'voucher',
      ],
    },
  })
  async processManualPayment(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateManualPaymentDto,
    @Query('mode') mode: 'partial' | 'both',
  ) {
    return this.paymentService.processManualPayment(dto, file, mode);
  }

  @Post('test/mercadopago')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Procesar pago con Mercado Pago' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pago procesado correctamente con Mercado Pago.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al procesar el pago.',
  })
  async processPayment(@Body() dto: CreateMercadoPagoDto) {
    return this.paymentService.testMercadoPagoPayment(dto);
  }
}
