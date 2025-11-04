import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Model } from 'mongoose';
import { Queue } from 'bullmq';
import { Appointment } from '../schema/appointment.schema';
import { ConfirmAppointmentDto, CreateAppointmentDto } from '../dto';
import { AppointmentStatus, MeetingType } from '../enum';
import { SF_APPOINTMENTS, toObjectId } from 'src/core/utils';
import { ClientType } from 'src/modules/user/enum';


@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectQueue('appointment-ready')
    private readonly appointmentReadyQueue: Queue,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    try {
      const appointment = await this.appointmentModel.create({
        ...dto,
        status: AppointmentStatus.PENDIENTE,
      });

      return appointment;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la cita: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    user_id?: string,
    limit = 10,
    offset = 0,
    search = '',
    sortField: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Appointment[] }> {
    try {
      const baseFilter: any = {};

      if (user_id) {
        baseFilter.user = toObjectId(user_id);
      }

      const searchFilter = search
        ? {
            $or: SF_APPOINTMENTS.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const filter = { ...baseFilter, ...searchFilter };

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.appointmentModel
          .find(filter)
          .collation({ locale: 'es', strength: 1 })
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.appointmentModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al listar citas: ${error.message}`,
      );
    }
  }

  async confirmAppointment(
    appointmentId: string,
    dto: ConfirmAppointmentDto,
  ): Promise<Appointment> {
    try {
      const appointment = await this.appointmentModel.findById(appointmentId);

      if (!appointment) {
        throw new NotFoundException('Cita no encontrada');
      }

      const updatedAppointment = await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        {
          $set: {
            appointment_date: dto.appointment_date,
            hour: dto.hour,
            status: AppointmentStatus.CONFIRMADA,
          },
        },
        { new: true },
      );

      const clientName = appointment.client_type === ClientType.PERSONA 
        ? `${appointment.first_name} ${appointment.last_name}`
        : appointment.contact_person;

      const formattedDate = new Date(dto.appointment_date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const meetingTypeText = appointment.meeting_type === MeetingType.VIRTUAL ? 'Virtual' : 'Presencial';

      // Agregar el job a la cola
      await this.appointmentReadyQueue.add('send-appointment-confirmation', {
        to: appointment.email,
        clientName,
        meetingType: meetingTypeText,
        date: formattedDate,
        hour: dto.hour,
        attendeesCount: appointment.attendees_count,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 1000,
        removeOnFail: 100,
      });

      return updatedAppointment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al confirmar la cita: ${error.message}`,
      );
    }
  }
}
