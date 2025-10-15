import {
  Controller,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreateMercadoPagoDto, CreatePaymentSchedulesDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';

@ApiTags('payments')
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
  async createPayment(@Body() dto: CreatePaymentSchedulesDto) {
    return this.paymentService.createPayments(dto);
  }

  @Post('mercadopago')
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
    return this.paymentService.processPayment(dto);
  }
}
