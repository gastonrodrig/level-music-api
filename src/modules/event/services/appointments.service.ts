import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from '../schema/appointment.schema';
import { ConfirmAppointmentDto, CreateAppointmentDto } from '../dto';
import { AppointmentStatus } from '../enum';
import { User } from 'src/modules/user/schema';
import { SF_APPOINTMENTS, toObjectId } from 'src/core/utils';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
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
