import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Model } from 'mongoose';
import { Queue } from 'bullmq';
import { Appointment } from '../schema/appointment.schema';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../dto';
import { AppointmentStatus, MeetingType } from '../enum';
import { User } from 'src/modules/user/schema';
import { ClientType } from 'src/modules/user/enum';
import { SF_APPOINTMENTS, toObjectId } from 'src/core/utils';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectQueue('appointment-ready')
    private readonly appointmentReadyQueue: Queue,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    try {
      let user = null;
      if (dto.user_id) {
        user = await this.userModel.findById(dto.user_id);
        if (!user) throw new BadRequestException('User not found');
      }

      const appointment = await this.appointmentModel.create({
        ...dto,
        user: user ? toObjectId(user._id) : null,
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

  async updateStatus(
    appointment_id: string,
    dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    try {
      const appointment = await this.appointmentModel.findById(appointment_id);
      if (!appointment) {
        throw new NotFoundException('Cita no encontrada');
      }

      // Solo enviar correo si cambia a CONFIRMADA y no estaba confirmada antes
      if (dto.status === AppointmentStatus.CONFIRMADA && appointment.status !== AppointmentStatus.CONFIRMADA) {
        const clientName = appointment.client_type === ClientType.PERSONA 
          ? `${appointment.first_name} ${appointment.last_name}`
          : appointment.contact_person;

        const formattedDate = new Date(appointment.date).toLocaleDateString('es-ES', {
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
          hour: appointment.hour,
          attendeesCount: appointment.attendees_count,
        });
      }

      appointment.status = dto.status;

      return await appointment.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al cambiar el estado de la cita: ${error.message}`,
      );
    }
  }
}
