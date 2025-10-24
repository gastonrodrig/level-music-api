import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentSchedule } from '../schema/payment-schedules.schema';
import { SalesDocument } from '../schema/sales-documents.schema';
import { SalesDocumentDetail } from '../schema/sales-documents-details.schema';
import { Event } from 'src/modules/event/schema/event.schema';
import { StatusType } from 'src/modules/event/enum/status-type.enum';
import MercadoPagoConfig, { Payment as MP_Payment } from 'mercadopago';
import { CreateManualPaymentDto, CreateMercadoPagoDto, CreatePaymentSchedulesDto } from '../dto';
import { PaymentType, PaymentStatus } from '../enum';
import { toObjectId } from 'src/core/utils';
import { StorageService } from 'src/modules/firebase/services';
import { Payment } from '../schema';

@Injectable()
export class PaymentService {
  private mp_payment: MP_Payment;

  constructor(
    @InjectModel(PaymentSchedule.name)
    private readonly scheduleModel: Model<PaymentSchedule>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,
    @InjectModel(SalesDocument.name)
    private readonly documentModel: Model<SalesDocument>,
    @InjectModel(SalesDocumentDetail.name)
    private readonly detailsModel: Model<SalesDocumentDetail>,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
    private readonly storageService: StorageService,
  ) {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });
    this.mp_payment = new MP_Payment(client);
  }

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

  async processManualPayment(
    dto: CreateManualPaymentDto,
    file?: Express.Multer.File,
    mode: 'partial' | 'both' = 'partial',
  ) {
    const { schedule_id, event_id, user_id, amount } = dto;

    // Subir comprobante
    let voucher_url = '';
    if (file) {
      const upload = await this.storageService.uploadFile(
        'payments',
        file,
        String(event_id),
      );
      voucher_url = upload.url;
    }

    // Crear pago manual para el pago parcial
    const payment = await this.paymentModel.create({
      ...dto,
      event_id: toObjectId(event_id),
      schedule_id: toObjectId(schedule_id),
      user_id: toObjectId(user_id),
      amount: Number(amount),
      voucher_url,
    });

    // Si el modo es "both", crear también el pago final
    if (mode === 'both') {
      const schedules = await this.scheduleModel.find({ event: event_id });
      const finalSchedule = schedules.find(
        (s) => s.payment_type === 'Final',
      );

      if (finalSchedule) {
        await this.paymentModel.create({
          ...dto,
          schedule_id: finalSchedule._id,
          payment_type: 'Final',
          amount: finalSchedule.total_amount,
          voucher_url,
        });
      }
    }

    return {
      message:
        mode === 'both'
          ? 'Pagos parcial y final registrados correctamente.'
          : 'Pago parcial registrado correctamente.',
      payment,
    };
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
      console.log(createMercadoPagoDto);
      console.log(this.mp_payment);
      const payment = await this.mp_payment.create({
        body: createMercadoPagoDto,
      });

      return payment;
    } catch (error) {
      console.error('Error en pago de prueba:', error);
      throw new BadRequestException(error.message || 'Error al procesar el pago de prueba');
    }
  }
}