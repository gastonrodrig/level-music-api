import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  UseGuards,
  UseInterceptors,
  Get,
  UploadedFiles,
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
import { AnyFilesInterceptor } from '@nestjs/platform-express';
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
  @Public()
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Registrar varios pagos manuales con comprobantes (uno por método)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pagos registrados correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al registrar los pagos.' })
  @ApiQuery({
    name: 'mode',
    required: false,
    description: 'Modo de pago: parcial (por defecto) o ambos',
    example: 'partial',
    schema: {
      type: 'string',
      enum: ['partial', 'both'],
      default: 'partial',
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payment_type: { type: 'string', example: 'Parcial', enum: ['Parcial', 'Final', 'Ambos'] },
        event_id: { type: 'string', example: '68fa352e038345fc4290f084' },
        user_id: { type: 'string', example: '68b9c17b445a8108efdf8d43' },
        payments: {
          type: 'array',
          description: 'Array de pagos con su información individual',
          items: {
            type: 'object',
            properties: {
              payment_method: {
                type: 'string',
                enum: ['Yape', 'Plin', 'Transferencia', 'Efectivo'],
                example: 'Yape',
              },
              amount: { type: 'number', example: 300 },
              operation_number: { type: 'string', example: 'YP123456' },
            },
            required: ['payment_method', 'amount'],
          },
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Array de imágenes (una por cada pago, en el mismo orden)',
        },
      },
      required: ['event_id', 'user_id', 'payments', 'images'],
    },
  })
  async processManualPayment(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateManualPaymentDto,
  ) {
    return this.paymentService.processManualPayment(dto, files);
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
