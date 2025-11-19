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
  Get,
  Param,
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
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
  // @UseGuards(FirebaseAuthGuard)
  // @ApiBearerAuth('firebase-auth')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Registrar varios pagos manuales con comprobantes (uno por método)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pagos registrados correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al registrar los pagos.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payment_type: { type: 'string', example: 'Parcial', enum: ['Parcial', 'Final', 'Ambos'] },
        event_id: { type: 'string', example: '68fa352e038345fc4290f084' },
        user_id: { type: 'string', example: '68b9c17b445a8108efdf8d43' },
        payments: {
          type: 'string',
          description: 'JSON string con array de pagos (uno por cada imagen)',
          example: JSON.stringify(
            [
              { payment_method: 'Yape', amount: 300, operation_number: 'YP123456' },
              { payment_method: 'Plin', amount: 200, operation_number: 'PL789012' },
            ],
            null,
            2
          ),
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Array de imágenes (una por cada pago, en el mismo orden)',
        },
      },
      required: ['payment_type', 'event_id', 'user_id', 'payments', 'images'],
    },
  })
  async processManualPayment(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    // console.log('body.payments type:', typeof body.payments);
    // console.log('body.payments value:', body.payments);
    // console.log('Is Array?:', Array.isArray(body.payments));
    return this.paymentService.processManualPayment(body as CreateManualPaymentDto, files);
  }

  @Get('user/:userId')
  // @UseGuards(FirebaseAuthGuard)
  // @ApiBearerAuth('firebase-auth')
  // @Public()
  // @ApiOperation({ summary: 'Obtener pagos por usuario' })
  // @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado de pago' })
  // @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  // @ApiQuery({ name: 'limit', required: false, description: 'Items por página', example: 20 })
  // @ApiResponse({ status: HttpStatus.OK, description: 'Pagos obtenidos correctamente.' })
  // async getPaymentsByUser(
  //   @Param('userId') userId: string,
  //   @Query('status') status?: string,
  //   @Query('page') page = '1',
  //   @Query('limit') limit = '20',
  // ) {
  //   return this.paymentService.getPaymentsByUser(userId, {
  //     status,
  //     page: Number(page),
  //     limit: Number(limit),
  //   });
  // }

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
