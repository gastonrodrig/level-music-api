import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Maintenance } from '../schema';
import { MaintenanceType, MaintenanceStatusType } from '../enum';
import { WhatsAppService } from '../../whatsapp/services/whatsapp.service';
import { getCurrentDate} from 'src/core/utils';

@Injectable()
export class MaintenanceNotificationSchedulerService {
  private readonly logger = new Logger(MaintenanceNotificationSchedulerService.name);

  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<Maintenance>,
    private readonly whatsappService: WhatsAppService,
  ) {}

 @Cron(CronExpression.EVERY_DAY_AT_9AM) // SOLO PARA PRUEBAS: Cada 30 segundos
  async checkUpcomingPreventiveMaintenances() {
    this.logger.log('🔔 Verificando mantenimientos PREVENTIVOS que vencen en 3 días...');

    try {
      // Usar la fecha actual en hora peruana
      const today = getCurrentDate();
      
      // Calcular 3 días después para notificaciones preventivas
      const threeDaysFromToday = new Date(today);
      threeDaysFromToday.setDate(threeDaysFromToday.getDate() + 3);
      
      // Crear rango completo del día en UTC (00:00:00 a 23:59:59 UTC)
      const startOfMaintenanceDay = new Date(threeDaysFromToday.getFullYear(), threeDaysFromToday.getMonth(), threeDaysFromToday.getDate(), 0, 0, 0, 0);
      const endOfMaintenanceDay = new Date(threeDaysFromToday.getFullYear(), threeDaysFromToday.getMonth(), threeDaysFromToday.getDate(), 23, 59, 59, 999);

      this.logger.log(`Buscando mantenimientos PREVENTIVOS programados para: ${startOfMaintenanceDay.toLocaleDateString()}`);
      this.logger.log(`Rango de búsqueda: ${startOfMaintenanceDay.toISOString()} hasta ${endOfMaintenanceDay.toISOString()}`);
      this.logger.log(`DEBUG - startOfMaintenanceDay: ${startOfMaintenanceDay.getTime()}`);
      this.logger.log(`DEBUG - endOfMaintenanceDay: ${endOfMaintenanceDay.getTime()}`);

      // Buscar mantenimientos PREVENTIVOS que vencen exactamente en 3 días
      const upcomingMaintenances = await this.maintenanceModel.find({
        type: MaintenanceType.PREVENTIVO,
        status: MaintenanceStatusType.PROGRAMADO,
        date: {
          $gte: startOfMaintenanceDay,
          $lt: new Date(endOfMaintenanceDay.getTime() + 1) // Incluir todo el día
        }
      });

      // Debug: Mostrar todos los mantenimientos preventivos para comparar
      const allPreventive = await this.maintenanceModel.find({
        type: MaintenanceType.PREVENTIVO,
        status: MaintenanceStatusType.PROGRAMADO,
      }).select('date equipment_name');
      
      this.logger.log(`DEBUG - Todos los mantenimientos preventivos programados:`);
      allPreventive.forEach(m => {
        const dateTime = m.date.getTime();
        const inRange = dateTime >= startOfMaintenanceDay.getTime() && dateTime <= endOfMaintenanceDay.getTime();
        this.logger.log(`- ${m.equipment_name}: ${m.date.toISOString()} (timestamp: ${dateTime}) [${inRange ? 'EN RANGO' : 'FUERA DE RANGO'}]`);
      });

      this.logger.log(`Encontrados ${upcomingMaintenances.length} mantenimientos PREVENTIVOS que vencen en 3 días`);

      // Enviar notificaciones para cada mantenimiento
      for (const maintenance of upcomingMaintenances) {
        await this.whatsappService.sendMaintenanceReminderToAdmins({
          equipmentName: maintenance.equipment_name,
          equipmentType: maintenance.equipment_type,
          maintenanceDate: maintenance.date,
          daysRemaining: 3,
          maintenanceId: maintenance._id.toString()
        });

        this.logger.log(`Notificaciones enviadas para mantenimiento PREVENTIVO del equipo: ${maintenance.equipment_name} (vence: ${maintenance.date.toLocaleDateString()})`);
      }

    } catch (error) {
      this.logger.error(`Error verificando mantenimientos preventivos próximos: ${error.message}`);
    }
  }


}