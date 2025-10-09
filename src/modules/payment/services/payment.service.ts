// src/modules/payment/services/payment.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentSchedule } from '../schema/payment-schedules.schema';
import { SalesDocument } from '../schema/sales-documents.schema';
import { SalesDocumentDetail } from '../schema/sales-documents-details.schema';
import { mercadoPagoClient } from './../mercadopago.config';
const { Payment } = require('mercadopago');

@Injectable()
export class PaymentService {
  private payment = new Payment(mercadoPagoClient);

  constructor(
    @InjectModel(PaymentSchedule.name)
    private readonly scheduleModel: Model<PaymentSchedule>,
    @InjectModel(SalesDocument.name)
    private readonly documentModel: Model<SalesDocument>,
    @InjectModel(SalesDocumentDetail.name)
    private readonly detailsModel: Model<SalesDocumentDetail>,
  ) {}

  async createPayment(scheduleId: string) {
    const schedule = await this.scheduleModel.findById(scheduleId);
    if (!schedule) throw new BadRequestException('No se encontró la programación de pago');

    const paymentData = {
      transaction_amount: schedule.total_amount,
    //   description: `Pago del evento ${schedule.event_id}`,
      payment_method_id: 'visa', // temporal
      payer: { email: 'cliente@test.com' },
    };

    try {
      const result = await this.payment.create({ body: paymentData });
      // ✅ Luego podrías actualizar el estado del schedule
      return result;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al crear pago en MercadoPago');
    }
  }
}
