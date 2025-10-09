import {
  Controller,
  Post,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':scheduleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear un pago para una programación de pago' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pago creado correctamente en MercadoPago',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el pago',
  })
  async pay(@Param('scheduleId') scheduleId: string) {
    return this.paymentService.createPayment(scheduleId);
  }
}
