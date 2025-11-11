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
    @Body() body: any,
    @Query('mode') mode: 'partial' | 'both' = 'partial',
  ) {
    // Normalizar posibles nombres de campo desde el frontend (imagen que enviaste usa manualPayments)
    if (!body.payments) {
      if (body.manualPayments) body.payments = body.manualPayments;
      else if (body.manualpayments) body.payments = body.manualpayments;
      else if (body.manual_payments) body.payments = body.manual_payments;
    }

    // Swagger / form-data: `payments` may come as a JSON string. Parse if needed.
    try {
      if (body && typeof body.payments === 'string') {
        body.payments = JSON.parse(body.payments);
      }
    } catch (e) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: ['payments must be a valid JSON array'],
      };
    }

    // Normalizar posibles nombres/valores de payment_type desde el frontend
    if (!body.payment_type && (body.selectedPaymentType || body.selectedPaymentTypeType)) {
      body.payment_type = body.selectedPaymentType || body.selectedPaymentTypeType;
    }
    if (body.payment_type && typeof body.payment_type === 'string') {
      const v = body.payment_type.toLowerCase();
      if (v === 'partial' || v === 'parcial') body.payment_type = 'Parcial';
      else if (v === 'final') body.payment_type = 'Final';
      else if (v === 'both' || v === 'ambos' || v === 'bothpayments') body.payment_type = 'Ambos';
      // else leave as-is (validation will catch incorrect values)
    }

    // Aceptar objeto único y normalizar a array
    if (body.payments && !Array.isArray(body.payments) && typeof body.payments === 'object') {
      body.payments = [body.payments];
    }

    // Convertir a DTO y validar manualmente para soportar multipart/form-data
    const dto = plainToInstance(CreateManualPaymentDto, body);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: false });
    if (errors.length > 0) {
      const messages = errors
        .map((e) => (e.constraints ? Object.values(e.constraints) : []))
        .flat();
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: messages,
      };
    }

    // Mapear archivos subidos a cada item de payments[] de forma robusta.
    const payments = dto.payments || [];
    const orderedFiles: Express.Multer.File[] = new Array(payments.length).fill(null);
    const unassignedFiles: Express.Multer.File[] = [];

    if (Array.isArray(files) && files.length > 0) {
      for (const f of files) {
        const field = f.fieldname || '';
        // Buscar índice en el fieldname: cualquier cosa[<index>]
        const m = field.match(/\[(\d+)\]/);
        if (m && m[1]) {
          const idx = Number(m[1]);
          if (!Number.isNaN(idx) && idx >= 0 && idx < payments.length) {
            orderedFiles[idx] = f;
            continue;
          }
        }

        // Si el fieldname es images or images[] or image, lo dejamos para asignar por orden
        if (/^images?\[?\]?$/i.test(field) || field.toLowerCase().includes('image') || field.toLowerCase().includes('voucher')) {
          unassignedFiles.push(f);
          continue;
        }

        // Intentar extraer dígitos al final del nombre (voucher_0, file0)
        const m2 = field.match(/(\d+)$/);
        if (m2 && m2[1]) {
          const idx = Number(m2[1]);
          if (!Number.isNaN(idx) && idx >= 0 && idx < payments.length) {
            orderedFiles[idx] = f;
            continue;
          }
        }

        // Si no se pudo asignar, agregar a unassigned
        unassignedFiles.push(f);
      }

      // Rellenar vacíos con archivos no asignados por orden
      let ui = 0;
      for (let i = 0; i < orderedFiles.length; i++) {
        if (!orderedFiles[i] && ui < unassignedFiles.length) {
          orderedFiles[i] = unassignedFiles[ui++];
        }
      }
    }

    // Validación final: cada payment debe tener su archivo correspondiente
    const missing = orderedFiles.filter((x) => !x).length;
    if (missing > 0) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: ['Debe enviar una imagen por cada pago, en el mismo orden o indicando indices en los fieldnames.'],
      };
    }

    return this.paymentService.processManualPayment(dto, orderedFiles, mode);
  }

  @Get('user/:userId')
  // @UseGuards(FirebaseAuthGuard)
  // @ApiBearerAuth('firebase-auth')
  @Public()
  @ApiOperation({ summary: 'Obtener pagos por usuario' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado de pago' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items por página', example: 20 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pagos obtenidos correctamente.' })
  async getPaymentsByUser(
    @Param('userId') userId: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.paymentService.getPaymentsByUser(userId, {
      status,
      page: Number(page),
      limit: Number(limit),
    });
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
