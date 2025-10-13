import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WhatsAppService } from '../services/whatsapp.service';
import { MaintenanceReminderDto } from '../dto';
import { getCurrentDate } from 'src/core/utils';

@Processor('whatsapp-notifications')
export class WhatsAppProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsAppProcessor.name);

  constructor(private readonly whatsappService: WhatsAppService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Procesando job de WhatsApp: ${job.name}`);

    switch (job.name) {
      case 'sendMaintenanceReminder':
        return this.handleMaintenanceReminder(job.data);
      default:
        this.logger.warn(`Tipo de job no reconocido: ${job.name}`);
    }
  }

  private async handleMaintenanceReminder(data: MaintenanceReminderDto): Promise<void> {
    try {
      const message = this.createMaintenanceMessage(data);
      
      await this.whatsappService.sendWhatsAppMessage(
        data.adminPhone,
        message
      );

      this.logger.log(`Recordatorio enviado exitosamente para mantenimiento ${data.maintenanceId}`);
    } catch (error) {
      this.logger.error(`Error enviando recordatorio: ${error.message}`);
      throw error;
    }
  }

  private createMaintenanceMessage(data: MaintenanceReminderDto): string {
    // Convertir string de fecha a Date object (las colas serializan las fechas como strings)
    const maintenanceDate = new Date(data.maintenanceDate);
    
    // Usar getCurrentDate() para obtener fecha en hora peruana y formatear
    const date = maintenanceDate.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Lima'
    });

    const urgencyEmoji = data.daysRemaining === 1 ? '🚨' : '⚠️';
    const urgencyText = data.daysRemaining === 1 ? 'URGENTE' : 'RECORDATORIO';

    return `${urgencyEmoji} *${urgencyText} - MANTENIMIENTO PREVENTIVO*

📋 *Detalles del Equipo:*
• Nombre: ${data.equipmentName}
• Tipo: ${data.equipmentType}
• Fecha programada: ${date}
• Faltan: ${data.daysRemaining} día(s)

⚠️ *Acción requerida:*
${data.daysRemaining === 1 
  ? '¡El mantenimiento preventivo debe realizarse MAÑANA!' 
  : `El mantenimiento preventivo debe realizarse en ${data.daysRemaining} días.`}

🔗 Revisa los detalles en el sistema de gestión.

---
*Level Music Corp - Sistema de Mantenimientos*`;
  }
}