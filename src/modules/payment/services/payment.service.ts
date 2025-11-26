import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
  CreateMercadoPagoPaymentDto,
  CreatePaymentSchedulesDto,
  ApproveAllPaymentsDto,
  ReportPaymentIssuesDto,
} from '../dto';
import { PaymentType, PaymentStatus, PaymentMethod } from '../enum';
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
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.error('⚠️ MERCADO_PAGO_ACCESS_TOKEN no está configurado en .env');
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN es requerido');
    }

    try {
      const client = new MercadoPagoConfig({
        accessToken,
      });
      this.mp_payment = new MP_Payment(client);
      console.log('✅ MercadoPago inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar MercadoPago:', error);
      throw error;
    }
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

      // Asegurarse de que dto.payments es un array
      let payments = dto.payments;
      if (typeof payments === 'string') {
        try {
          payments = JSON.parse(payments);
        } catch (e) {
          throw new BadRequestException('Formato inválido en payments');
        }
      }

      for (const [index, pay] of payments.entries()) {
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

  /**
   * Procesar pago con Mercado Pago (PRODUCCIÓN - SIN SIMULACIÓN)
   */
  async processMercadoPagoPayment(dto: CreateMercadoPagoPaymentDto) {
    try {
      console.log('📤 Procesando pago REAL con Mercado Pago');
      console.log('📋 Datos recibidos:', {
        event_id: dto.event_id,
        user_id: dto.user_id,
        amount: dto.transaction_amount,
        payment_type: dto.payment_type,
      });

      // Validaciones
      if (!dto.token || dto.token.trim() === '') {
        throw new BadRequestException('Token de pago es requerido');
      }

      if (dto.transaction_amount <= 0) {
        throw new BadRequestException('El monto debe ser mayor a 0');
      }

      if (dto.transaction_amount > 10000) {
        throw new BadRequestException('El monto máximo permitido es S/ 10,000');
      }

      // Verificar que el evento existe
      const event = await this.eventModel.findById(dto.event_id);
      if (!event) {
        throw new BadRequestException('Evento no encontrado');
      }

      // Preparar datos para Mercado Pago
      const paymentData = {
        transaction_amount: Number(dto.transaction_amount),
        token: dto.token,
        description: dto.description || `Pago ${dto.payment_type} - Evento: ${event.name}`,
        installments: dto.installments || 1,
        payment_method_id: dto.payment_method_id || 'visa',
        payer: {
          email: dto.payer.email,
          ...(dto.payer.identification && {
            identification: {
              type: dto.payer.identification.type || 'DNI',
              number: dto.payer.identification.number || '',
            },
          }),
        },
      };

      console.log('📦 Enviando a Mercado Pago:', {
        amount: paymentData.transaction_amount,
        email: paymentData.payer.email,
        installments: paymentData.installments,
      });

      // Llamar a la API de Mercado Pago
      const mpResponse = await this.mp_payment.create({
        body: paymentData,
      });

      console.log('✅ Respuesta de Mercado Pago recibida:', {
        id: mpResponse.id,
        status: mpResponse.status,
        status_detail: mpResponse.status_detail,
      });

      // Determinar el estado del pago según la respuesta de MP
      let paymentStatus: PaymentStatus;
      
      switch (mpResponse.status) {
        case 'approved':
          paymentStatus = PaymentStatus.APROBADO;
          break;
        case 'pending':
        case 'in_process':
          paymentStatus = PaymentStatus.PENDIENTE;
          break;
        case 'rejected':
        case 'cancelled':
          paymentStatus = PaymentStatus.RECHAZADO;
          break;
        default:
          paymentStatus = PaymentStatus.PENDIENTE;
      }

      // Crear registro del pago en la base de datos
      const payment = await this.paymentModel.create({
        payment_type: dto.payment_type,
        payment_method: PaymentMethod.TRANSFERENCIA,
        amount: dto.transaction_amount,
        operation_number: mpResponse.id?.toString(),
        status: paymentStatus,
        event: toObjectId(dto.event_id),
        user: toObjectId(dto.user_id),
        mercadopago_id: mpResponse.id?.toString(),
        mercadopago_status: mpResponse.status,
        mercadopago_response: mpResponse,
        ...(paymentStatus === PaymentStatus.APROBADO && { approved_at: new Date() }),
      });

      // Actualizar estado del evento solo si el pago fue aprobado
      if (mpResponse.status === 'approved') {
        event.status = StatusType.EN_SEGUIMIENTO;
        await event.save();
        console.log('✅ Estado del evento actualizado a EN_SEGUIMIENTO');
      }

      console.log('💾 Pago guardado en BD:', payment._id);

      return {
        success: mpResponse.status === 'approved',
        message: this.getPaymentStatusMessage(mpResponse.status),
        payment: {
          _id: payment._id,
          payment_type: payment.payment_type,
          amount: payment.amount,
          status: payment.status,
          mercadopago_id: payment.mercadopago_id,
          created_at: payment.created_at,
        },
        mercadopago_response: {
          id: mpResponse.id,
          status: mpResponse.status,
          status_detail: mpResponse.status_detail,
          payment_method_id: mpResponse.payment_method_id,
          payment_type_id: mpResponse.payment_type_id,
        },
      };
    } catch (error) {
      console.error('❌ Error al procesar pago con Mercado Pago:', error);
      
      // Log detallado del error
      if (error.cause) {
        console.error('📋 Causa del error:', JSON.stringify(error.cause, null, 2));
      }

      // Mensajes de error más específicos
      if (error.message?.includes('Card Token not found')) {
        throw new BadRequestException('Token de tarjeta inválido o expirado. Por favor, intente nuevamente.');
      }

      if (error.message?.includes('insufficient_amount')) {
        throw new BadRequestException('Fondos insuficientes en la tarjeta.');
      }

      if (error.message?.includes('invalid_card')) {
        throw new BadRequestException('Tarjeta inválida. Verifique los datos ingresados.');
      }

      throw new BadRequestException(
        error.message || 'Error al procesar el pago con Mercado Pago',
      );
    }
  }

  /**
   * Obtener mensaje amigable según el estado del pago
   */
  private getPaymentStatusMessage(status: string): string {
    const messages = {
      approved: 'Pago aprobado exitosamente',
      pending: 'Pago pendiente de confirmación',
      in_process: 'Pago en proceso de aprobación',
      rejected: 'Pago rechazado',
      cancelled: 'Pago cancelado',
    };
    return messages[status] || 'Estado de pago desconocido';
  }

  /**
   * Aprobar todos los pagos pendientes de un evento
   */
  async approveAllPayments(dto: ApproveAllPaymentsDto) {
    try {
      const { event_id } = dto;

      const event = await this.eventModel.findById(event_id);
      if (!event) {
        throw new BadRequestException('Evento no encontrado');
      }

      const pendingPayments = await this.paymentModel.find({
        event: toObjectId(event_id),
        status: PaymentStatus.PENDIENTE,
      });

      if (pendingPayments.length === 0) {
        return {
          success: false,
          message: 'No hay pagos pendientes para aprobar',
          approved_count: 0,
          total_amount: 0,
        };
      }

      const updateResult = await this.paymentModel.updateMany(
        {
          event: toObjectId(event_id),
          status: PaymentStatus.PENDIENTE,
        },
        {
          $set: {
            status: PaymentStatus.APROBADO,
            approved_at: new Date(),
          },
        },
      );

      const totalAmount = pendingPayments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0,
      );

      event.status = StatusType.EN_SEGUIMIENTO;
      await event.save();

      return {
        success: true,
        message: `${updateResult.modifiedCount} pagos aprobados exitosamente`,
        approved_count: updateResult.modifiedCount,
        total_amount: totalAmount,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error al aprobar los pagos',
      );
    }
  }

  /**
   * Reportar desconformidades en los pagos
   */
  async reportPaymentIssues(dto: ReportPaymentIssuesDto) {
    try {
      const { event_id, issues } = dto;

      if (!issues || issues.length === 0) {
        throw new BadRequestException('Debe reportar al menos un problema');
      }

      const event = await this.eventModel.findById(event_id);
      if (!event) {
        throw new BadRequestException('Evento no encontrado');
      }

      const paymentIds = issues.map((issue) => toObjectId(issue.payment_id));
      const payments = await this.paymentModel.find({
        _id: { $in: paymentIds },
        event: toObjectId(event_id),
      });

      if (payments.length !== issues.length) {
        throw new BadRequestException(
          'Uno o más pagos no pertenecen al evento o no existen',
        );
      }

      await this.paymentModel.updateMany(
        { _id: { $in: paymentIds } },
        {
          $set: {
            status: PaymentStatus.CON_OBSERVACIONES,
            has_issues: true,
            issues: issues.map((issue) => ({
              category: issue.category,
              comments: issue.comments || '',
              reported_at: new Date(),
            })),
          },
        },
      );

      event.status = StatusType.POR_VERIFICAR;
      await event.save();

      return {
        success: true,
        message: 'Reporte de desconformidades enviado exitosamente',
        issues_count: issues.length,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error al reportar desconformidades',
      );
    }
  }

  /**
   * Obtener todas las programaciones de pago de un evento
   */
  async getPaymentsByEvent(eventId: string): Promise<any[]> {
    try {
      const payments = await this.scheduleModel
        .find({ event: toObjectId(eventId) })
        .sort({ created_at: -1 })
        .lean()
        .exec();

      return payments;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error obteniendo los pagos del evento: ${error.message}`,
      );
    }
  }

  /**
   * Obtener solo pagos manuales de un evento (con comprobante o de Mercado Pago)
   */
  async getManualPaymentsByEvent(eventId: string): Promise<any[]> {
    try {
      const payments = await this.paymentModel
        .find({ 
          event: toObjectId(eventId),
          $or: [
            { voucher_url: { $exists: true, $ne: null } },
            { mercadopago_id: { $exists: true, $ne: null } },
          ]
        })
        .sort({ created_at: -1 })
        .populate('user', 'email first_name last_name')
        .lean()
        .exec();

      return payments;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error obteniendo los pagos manuales del evento: ${error.message}`,
      );
    }
  }
}
