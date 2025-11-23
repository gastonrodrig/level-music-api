import { Injectable, BadRequestException } from '@nestjs/common';
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
      throw new BadRequestException('Error al crear las programaciones de pago');
    }
  }

  async processManualPayment(
    dto: CreateManualPaymentDto,
    files: Express.Multer.File[],
  ) {
    try {
      const event = await this.eventModel.findById(dto.event_id);
      if (!event) throw new BadRequestException('Evento no encontrado');

      event.status = StatusType.POR_VERIFICAR;
      await event.save();

      const createdPayments = [];

      for (const [index, pay] of dto.payments.entries()) {
        const file = files[index];

        // Subir comprobante
        const upload = await this.storageService.uploadFile(
          'payments',
          file,
          String(dto.event_id),
        );

        // Validar tipo de pago
        if (
          dto.payment_type !== PaymentType.PARCIAL &&
          dto.payment_type !== PaymentType.FINAL &&
          dto.payment_type !== PaymentType.AMBOS
        ) {
          throw new BadRequestException('Tipo de pago inválido.');
        }

        // Crear pago simple (mapear DIRECTAMENTE los campos del DTO)
        const payment = await this.paymentModel.create({
          payment_type: dto.payment_type,
          payment_method: pay.payment_method,
          amount: pay.amount,
          operation_number: pay.operation_number ? pay.operation_number : null,
          voucher_url: upload.url,
          status: PaymentStatus.PENDIENTE,
          event: toObjectId(dto.event_id),
          user: toObjectId(dto.user_id),
        });

        createdPayments.push(payment);
      }

      return createdPayments;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error al procesar el pago manual',
      );
    }
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
