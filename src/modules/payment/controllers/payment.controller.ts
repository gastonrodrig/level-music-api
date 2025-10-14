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
import { CreatePaymentSchedulesDto } from '../dto';
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
  async create(@Body() dto: CreatePaymentSchedulesDto) {
    return this.paymentService.createPayments(dto);
  } 
}
