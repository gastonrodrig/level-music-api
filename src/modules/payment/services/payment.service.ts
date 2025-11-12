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

  // Obtener todos los pagos por usuario con filtros y paginación
  // async getPaymentsByUser(
  //   userId: string,
  //   options?: { status?: string; page?: number; limit?: number },
  // ) {
  //   const page = options?.page && options.page > 0 ? options.page : 1;
  //   const limit = options?.limit && options.limit > 0 ? options.limit : 20;
  //   const skip = (page - 1) * limit;

  //   const filter: any = { user: toObjectId(userId) };
  //   if (options?.status) {
  //     filter.status = options.status;
  //   }

  //   const [data, total] = await Promise.all([
  //     this.paymentModel
  //       .find(filter)
  //       // el esquema usa `created_at`, no `createdAt`
  //       .sort({ created_at: -1 })
  //       .skip(skip)
  //       .limit(limit)
  //       .populate('schedule')
  //       .populate('event')
  //       .lean(),
  //     this.paymentModel.countDocuments(filter),
  //   ]);

  //   return {
  //     data,
  //     total,
  //     page,
  //     limit,
  //     pages: Math.ceil(total / limit) || 1,
  //   };
  // }

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
    const { payment_type, event_id, user_id, payments } = dto;

    const schedules = await this.scheduleModel
      .find({ event: toObjectId(event_id) })
      .lean();

    const parcialSchedule = schedules.find((s) => s.payment_type === PaymentType.PARCIAL);
    const finalSchedule = schedules.find((s) => s.payment_type === PaymentType.FINAL);

    const createdPayments = [];

    // Iterar cada pago enviado
    for (let i = 0; i < payments.length; i++) {
      const pay = payments[i];
      const file = files[i];

      // Subir comprobante
      const upload = await this.storageService.uploadFile('payments', file, String(event_id));
      const voucher_url = upload.url;

      let paymentType = payment_type;
      let targetSchedule = null;

      // Caso 1: Si el pago es tipo AMBOS (el tipo viene en el DTO raíz)
      if (payment_type === PaymentType.AMBOS) {
        paymentType = PaymentType.AMBOS;

        // Marcar ambos schedules como completos
        await this.scheduleModel.updateMany(
          { event: toObjectId(event_id) },
          { status: PaymentStatus.COMPLETO },
        );

        // Registrar el pago (no asociado a schedule) y continuar
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
        // Caso 3: Modo parcial normal -> asignar schedule en base al tipo raíz
        if (payment_type === PaymentType.PARCIAL) {
          if (!parcialSchedule) {
            throw new BadRequestException('No se encontró el schedule parcial.');
          }
          targetSchedule = parcialSchedule;
          paymentType = PaymentType.PARCIAL;
        } else if (payment_type === PaymentType.FINAL) {
          if (!finalSchedule) {
            throw new BadRequestException('No se encontró el schedule final.');
          }
          targetSchedule = finalSchedule;
          paymentType = PaymentType.FINAL;
        } else {
          throw new BadRequestException('Tipo de pago inválido para asignar schedule.');
        }
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
