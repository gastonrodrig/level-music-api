import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import * as twilio from 'twilio';
import { User } from '../../user/schema';
import { Roles, Estado } from 'src/core/constants/app.constants';
import { MaintenanceReminderDto } from '../dto';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private twilioClient: twilio.Twilio;

  constructor(
    @InjectQueue('whatsapp-notifications')
    private whatsappQueue: Queue,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  // Método principal que busca admins y envía notificaciones
  async sendMaintenanceReminderToAdmins(maintenanceData: {
    equipmentName: string;
    equipmentType: string;
    maintenanceDate: Date;
    daysRemaining: number;
    maintenanceId: string;
  }): Promise<void> {
    try {
      // 1. Buscar todos los administradores activos con teléfono
      const admins = await this.getActiveAdmins();
      
      if (admins.length === 0) {
        this.logger.warn('No se encontraron administradores activos con número de teléfono');
        return;
      }

      this.logger.log(`Enviando notificación a ${admins.length} administrador(es)`);

      // 2. Enviar a cada administrador
      for (const admin of admins) {
        const reminderData: MaintenanceReminderDto = {
          adminPhone: admin.phone,
          adminName: `${admin.first_name} ${admin.last_name}`,
          ...maintenanceData
        };

        // Encolar para cada admin
        await this.whatsappQueue.add('sendMaintenanceReminder', reminderData, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        });

        this.logger.log(`Recordatorio encolado para admin: ${admin.first_name} ${admin.last_name} (${admin.phone})`);
      }

    } catch (error) {
      this.logger.error(`Error enviando recordatorios a administradores: ${error.message}`);
      throw error;
    }
  }

  // Buscar administradores activos con teléfono
  private async getActiveAdmins(): Promise<User[]> {
    return await this.userModel.find({
      role: Roles.ADMIN,
      status: Estado.ACTIVO,
      $and: [
        { phone: { $exists: true } },
        { phone: { $ne: null } },
        { phone: { $ne: '' } },
        { phone: { $regex: /^\+?[1-9]\d{8,14}$/ } } // Al menos 9 dígitos total (mínimo para móviles)
      ]
    }).select('first_name last_name phone email').lean();
  }

  // Método para envío directo (usado por el processor)
  async sendWhatsAppMessage(to: string, message: string): Promise<any> {
    try {
      const formattedPhone = this.formatPhoneNumber(to);
      
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${formattedPhone}`
      });

      this.logger.log(`Mensaje enviado exitosamente a ${formattedPhone}. SID: ${result.sid}`);
      return result;
    } catch (error) {
      this.logger.error(`Error enviando mensaje a ${to}: ${error.message}`);
      throw error;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Limpiar el número
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Si no empieza con +, agregar código de país
    if (!phone.startsWith('+')) {
      if (cleanPhone.startsWith('51')) {
        return `+${cleanPhone}`;
      } else {
        return `+51${cleanPhone}`;
      }
    }
    return phone;
  }

  // Método para obtener info de admins (útil para debugging)
  async getAdminsInfo(): Promise<any[]> {
    const admins = await this.getActiveAdmins();
    return admins.map(admin => ({
      name: `${admin.first_name} ${admin.last_name}`,
      phone: admin.phone,
      email: admin.email
    }));
  }
}