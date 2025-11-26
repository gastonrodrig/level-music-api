import {
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { 
  CreateManualPaymentDto, 
  CreateMercadoPagoPaymentDto, // ✅ Importar el nuevo DTO
  CreatePaymentSchedulesDto, 
  ApproveAllPaymentsDto, 
  ReportPaymentIssuesDto 
} from '../dto';
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
    @Body() dto: CreateManualPaymentDto,
  ) {
    return this.paymentService.processManualPayment(dto, files);
  }

  @Post('mercadopago')
  @Public() 
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Procesar pago con Mercado Pago (Producción)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pago procesado correctamente con Mercado Pago.',
    schema: {
      example: {
        success: true,
        message: 'Pago aprobado exitosamente',
        payment: {
          _id: '674xxx',
          payment_type: 'Parcial',
          amount: 166.1,
          status: 'Aprobado',
          mercadopago_id: '1234567890',
          created_at: '2025-11-26T...',
        },
        mercadopago_response: {
          id: 1234567890,
          status: 'approved',
          status_detail: 'accredited',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al procesar el pago.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Token de tarjeta inválido o expirado',
        error: 'Bad Request',
      },
    },
  })
  async processMercadoPagoPayment(@Body() dto: CreateMercadoPagoPaymentDto) {
    return this.paymentService.processMercadoPagoPayment(dto);
  }

  @Post('approve-all')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprobar todos los pagos pendientes de un evento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pagos aprobados correctamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al aprobar los pagos',
  })
  async approveAllPayments(@Body() dto: ApproveAllPaymentsDto) {
    return this.paymentService.approveAllPayments(dto);
  }

  @Post('report-issues')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reportar desconformidades en pagos de un evento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reporte enviado correctamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al enviar el reporte',
  })
  async reportPaymentIssues(@Body() dto: ReportPaymentIssuesDto) {
    return this.paymentService.reportPaymentIssues(dto);
  }

  @Get('event/:eventId')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los pagos de un evento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pagos del evento obtenidos correctamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Evento no encontrado',
  })
  async getPaymentsByEvent(@Param('eventId') eventId: string) {
    return this.paymentService.getPaymentsByEvent(eventId);
  }

  @Get('manual/event/:eventId')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener solo pagos manuales de un evento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pagos manuales obtenidos correctamente',
  })
  async getManualPaymentsByEvent(@Param('eventId') eventId: string) {
    return this.paymentService.getManualPaymentsByEvent(eventId);
  }
}
