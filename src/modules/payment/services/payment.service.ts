import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentSchedule } from '../schema/payment-schedules.schema';
import { SalesDocument } from '../schema/sales-documents.schema';
import { SalesDocumentDetail } from '../schema/sales-documents-details.schema';
import { Event } from 'src/modules/event/schema/event.schema';
import { StatusType } from 'src/modules/event/enum/status-type.enum';
import MercadoPagoConfig, { Payment as MP_Payment } from 'mercadopago';
import {
  CreateManualPaymentDto,
  CreateMercadoPagoDto,
  CreatePaymentSchedulesDto,
} from '../dto';
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

  // Crear schedules de pago (Parcial y Final)
  async createPaymentSchedules(createPaymentSchedulesDto: CreatePaymentSchedulesDto) {
    const {
      partial_payment_date,
      final_payment_date,
      event_id,
      partial_amount,
      final_amount,
    } = createPaymentSchedulesDto;

    if (!partial_payment_date || !final_payment_date) {
      throw new BadRequestException('Las fechas de pago son obligatorias');
    }

    try {
      const partialPayment = await this.scheduleModel.create({
        payment_type: PaymentType.PARCIAL,
        due_date: new Date(partial_payment_date),
        total_amount: partial_amount || 0,
        status: PaymentStatus.PENDIENTE,
        event: toObjectId(event_id),
      });

      const finalPayment = await this.scheduleModel.create({
        payment_type: PaymentType.FINAL,
        due_date: new Date(final_payment_date),
        total_amount: final_amount || 0,
        status: PaymentStatus.PENDIENTE,
        event: toObjectId(event_id),
      });

      await this.eventModel.findByIdAndUpdate(
        event_id,
        { status: StatusType.PAGOS_ASIGNADOS },
        { new: true },
      );

      return { partialPayment, finalPayment };
    } catch (error) {
      console.error('Error al crear pagos:', error);
      throw new BadRequestException('Error al crear las programaciones de pago');
    }
  }

  // Registrar pagos manuales (modo parcial, ambos, etc.)
  async processManualPayment(
    dto: CreateManualPaymentDto,
    files: Express.Multer.File[],
    mode: 'partial' | 'both' = 'partial',
  ) {
    const { event_id, user_id, payments } = dto;

    if (!payments?.length) {
      throw new BadRequestException('Debe enviar al menos un pago.');
    }

    if (!files?.length || files.length !== payments.length) {
      throw new BadRequestException(
        'Debe enviar una imagen por cada pago, en el mismo orden.',
      );
    }

    const schedules = await this.scheduleModel
      .find({ event: toObjectId(event_id) })
      .lean();

    const parcialSchedule = schedules.find((s) => s.payment_type === PaymentType.PARCIAL);
    const finalSchedule = schedules.find((s) => s.payment_type === PaymentType.FINAL);

    if (mode === 'both' && (!parcialSchedule || !finalSchedule)) {
      throw new BadRequestException('No se encontraron los schedules de pago parcial y final.');
    }

    const createdPayments = [];

    // Iterar cada pago enviado
    for (let i = 0; i < payments.length; i++) {
      const pay = payments[i];
      const file = files[i];

      // Subir comprobante
      const upload = await this.storageService.uploadFile('payments', file, String(event_id));
      const voucher_url = upload.url;

      let paymentType = pay.payment_type;
      let targetSchedule = null;

      // Caso 1: Si el pago es tipo AMBOS
      if (pay.payment_type === PaymentType.AMBOS) {
        paymentType = PaymentType.AMBOS;

        // Marcar ambos schedules como completos
        await this.scheduleModel.updateMany(
          { event: toObjectId(event_id) },
          { status: PaymentStatus.COMPLETO },
        );

        // Registrar el pago sin asociarlo a un schedule específico
        const payment = await this.paymentModel.create({
          payment_type: PaymentType.AMBOS,
          payment_method: pay.payment_method,
          amount: pay.amount,
          operation_number: pay.operation_number || null,
          voucher_url,
          status: PaymentStatus.COMPLETO,
          event: toObjectId(event_id),
          user: toObjectId(user_id),
        });

        createdPayments.push(payment);
        continue;
      }

      // Caso 2: Modo BOTH -> priorizar parcial
      if (mode === 'both') {
        // Verificar si el parcial está completo
        const pagosParcial = await this.paymentModel.aggregate([
          { $match: { schedule: new Types.ObjectId(parcialSchedule._id) } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const totalParcialPagado = pagosParcial[0]?.total || 0;
        const restanteParcial =
          (parcialSchedule.total_amount || 0) - totalParcialPagado;

        if (restanteParcial > 0) {
          paymentType = PaymentType.PARCIAL;
          targetSchedule = parcialSchedule;
        } else {
          paymentType = PaymentType.FINAL;
          targetSchedule = finalSchedule;
        }
      } else {
        // Caso 3: Modo parcial normal
        const schedule = await this.scheduleModel.findById(pay.schedule_id);
        if (!schedule) {
          throw new BadRequestException(
            `No se encontró el PaymentSchedule con ID ${pay.schedule_id}`,
          );
        }
        targetSchedule = schedule;
        paymentType = schedule.payment_type;
      }

      if (!targetSchedule) {
        throw new BadRequestException('No se encontró un schedule válido para aplicar el pago.');
      }

      // Crear registro de pago
      const payment = await this.paymentModel.create({
        payment_type: paymentType,
        payment_method: pay.payment_method,
        amount: pay.amount,
        operation_number: pay.operation_number || null,
        voucher_url,
        status: PaymentStatus.PENDIENTE,
        schedule: toObjectId(targetSchedule._id),
        event: toObjectId(event_id),
        user: toObjectId(user_id),
      });

      createdPayments.push(payment);

      // Actualizar estado del schedule si se completó
      const pagosConfirmados = await this.paymentModel.aggregate([
        { $match: { schedule: new Types.ObjectId(targetSchedule._id) } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const totalPagado = pagosConfirmados[0]?.total || 0;
      if (totalPagado >= (targetSchedule.total_amount || 0)) {
        await this.scheduleModel.findByIdAndUpdate(targetSchedule._id, {
          status: PaymentStatus.COMPLETO,
        });
      }
    }

    return {
      statusCode: HttpStatus.CREATED,
      message:
        mode === 'both'
          ? 'Pagos registrados correctamente (priorizando el pago parcial).'
          : 'Pagos manuales registrados correctamente.',
      count: createdPayments.length,
      payments: createdPayments,
    };
  }

  // Prueba de integración con Mercado Pago
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
