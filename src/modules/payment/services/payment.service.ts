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
import { PaymentType, Status } from '../enum';
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

  async createPayments(createPaymentSchedulesDto: CreatePaymentSchedulesDto) {
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
        status: Status.PENDIENTE,
        event: toObjectId(event_id),
      });

      // Crear pago final
      const finalPayment = await this.scheduleModel.create({
        payment_type: PaymentType.FINAL,
        due_date: new Date(final_payment_date),
        total_amount: final_amount || 0,
        status: Status.PENDIENTE,
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

  async processPayment(dto: CreateMercadoPagoDto) {
    try {
      const body = JSON.parse(JSON.stringify(dto));

      const result = await this.payment.create({ body });

      return {
        message: 'Pago procesado correctamente.',
        data: result,
      };
    } catch (error) {
      console.error('Error al crear pago con Mercado Pago:', error);
      throw new BadRequestException('No se pudo procesar el pago.');
    }
  }
}
