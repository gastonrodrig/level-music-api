import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentSchedule } from '../schema/payment-schedules.schema';
import { SalesDocument } from '../schema/sales-documents.schema';
import { SalesDocumentDetail } from '../schema/sales-documents-details.schema';
import { Event } from 'src/modules/event/schema/event.schema';
import { StatusType } from 'src/modules/event/enum/status-type.enum';
import { mercadoPagoClient } from './../mercadopago.config';
import { Payment } from 'mercadopago';
import { CreateMercadoPagoDto, CreatePaymentSchedulesDto } from '../dto';
import { PaymentType, PaymentStatus } from '../enum';
import { toObjectId } from 'src/core/utils';

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
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
  ) {}

  async createPaymentSchedules(createPaymentSchedulesDto: CreatePaymentSchedulesDto) {
    const { 
      partial_payment_date, 
      final_payment_date, 
      event_id, 
      partial_amount, 
      final_amount 
    } = createPaymentSchedulesDto;

    if (!partial_payment_date || !final_payment_date) {
      throw new BadRequestException('Las fechas de pago son obligatorias');
    }

    try {
      // Crear pago parcial
      const partialPayment = await this.scheduleModel.create({
        payment_type: PaymentType.PARCIAL,
        due_date: new Date(partial_payment_date),
        total_amount: partial_amount || 0,
        status: PaymentStatus.PENDIENTE,
        event: toObjectId(event_id),
      });

      // Crear pago final
      const finalPayment = await this.scheduleModel.create({
        payment_type: PaymentType.FINAL,
        due_date: new Date(final_payment_date),
        total_amount: final_amount || 0,
        status: PaymentStatus.PENDIENTE,
        event: toObjectId(event_id),
      });

      // Actualizar el estado del evento a "Pagos Asignados"
      await this.eventModel.findByIdAndUpdate(
        event_id,
        { status: StatusType.PAGOS_ASIGNADOS },
        { new: true }
      );

      return { partialPayment, finalPayment };
    } catch (error) {
      console.error('Error al crear pagos:', error);
      throw new BadRequestException('Error al crear las programaciones de pago');
    }
  }

  // async processPayment(dto: CreateMercadoPagoDto) {
  //   try {
  //     const { event_id, payment_type, transaction_amount, ...mercadoPagoData } = dto;
  //     const body = JSON.parse(JSON.stringify(mercadoPagoData));

  //     // Procesar pago con MercadoPago
  //     const result = await this.payment.create({ body });

  //     if (result.status === 'approved') {
  //       // Buscar y actualizar el cronograma de pago correspondiente
  //       const paymentSchedule = await this.scheduleModel.findOneAndUpdate(
  //         {
  //           event: toObjectId(event_id),
  //           payment_type: PaymentType[payment_type],
  //           status: PaymentStatus.PENDIENTE
  //         },
  //         {
  //           status: PaymentStatus.COMPLETO,
  //           paid_date: new Date(),
  //           mercado_pago_payment_id: result.id,
  //           actual_amount: transaction_amount
  //         },
  //         { new: true }
  //       );

  //       if (!paymentSchedule) {
  //         throw new BadRequestException('No se encontró el cronograma de pago correspondiente');
  //       }

  //       // Verificar si ambos pagos están completos para actualizar el estado del evento
  //       const pendingPayments = await this.scheduleModel.countDocuments({
  //         event: toObjectId(event_id),
  //         status: PaymentStatus.PENDIENTE
  //       });

  //       // Si no hay pagos pendientes, actualizar estado del evento
  //       if (pendingPayments === 0) {
  //         await this.eventModel.findByIdAndUpdate(
  //           event_id,
  //           { status: StatusType.APROBADO },
  //           { new: true }
  //         );
  //       }

  //       return {
  //         message: 'Pago procesado correctamente.',
  //         data: {
  //           mercadoPagoResult: result,
  //           paymentSchedule,
  //           allPaymentsCompleted: pendingPayments === 0
  //         },
  //       };
  //     } else {
  //       throw new BadRequestException('El pago no fue aprobado por MercadoPago');
  //     }
  //   } catch (error) {
  //     console.error('Error al procesar pago:', error);
  //     throw new BadRequestException(error.message || 'No se pudo procesar el pago.');
  //   }
  // }

  async testMercadoPagoPayment(createMercadoPagoDto: CreateMercadoPagoDto) {
    try {
      const payment = await this.payment.create({
        body: createMercadoPagoDto,
      });

      return {
        message: 'Pago procesado correctamente (modo prueba)',
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        payment_type_id: payment.payment_type_id,
        date_approved: payment.date_approved,
        card_last_four: payment.card?.last_four_digits,
        raw_response: payment,
      };
    } catch (error) {
      console.error('Error en pago de prueba:', error);
      throw new BadRequestException(error.message || 'Error al procesar el pago de prueba');
    }
  }
}
