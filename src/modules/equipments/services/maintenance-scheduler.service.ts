import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipment, Maintenance } from '../schema';
import { MaintenanceType, MaintenanceStatusType, EquipmentStatusType } from '../enum';
import { getCurrentDateNormalized } from 'src/core/utils';

@Injectable()
export class PreventiveMaintenanceSchedulerService {
  private readonly logger = new Logger(PreventiveMaintenanceSchedulerService.name);

  constructor(
    @InjectModel(Equipment.name)
    private equipmentModel: Model<Equipment>,
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<Maintenance>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handlePreventiveMaintenance() {
    this.logger.log('🔧 Iniciando revisión automática de mantenimientos preventivos...');

    const today = new Date(getCurrentDateNormalized());

    const equipments = await this.equipmentModel.find({
      status: EquipmentStatusType.DISPONIBLE,
    });

    for (const equipment of equipments) {
      // Obtenemos la base de cálculo: último mantenimiento
      const baseDate = equipment.last_maintenance_date;

      // Calculamos la fecha esperada para el siguiente mantenimiento
      const expectedNextDate = new Date(baseDate);

      expectedNextDate.setDate(expectedNextDate.getDate() + equipment.maintenance_interval_days - 7);

      // Si aún no le toca, lo saltamos
      if (expectedNextDate > today) {
        this.logger.log(`Equipo ${equipment.name} aún no requiere mantenimiento preventivo.`);
        continue;
      }

      // Validamos que no exista ya un mantenimiento pendiente
      const existingMaintenance = await this.maintenanceModel.findOne({
        equipment: equipment._id,
        status: { $in: [MaintenanceStatusType.EN_PROGRESO, MaintenanceStatusType.PROGRAMADO] },
      });

      if (existingMaintenance) {
        this.logger.warn(`Ya existe un mantenimiento preventivo pendiente para ${equipment.name}.`);
        continue;
      }

      // Generamos el mantenimiento preventivo
      await this.maintenanceModel.create({
        type: MaintenanceType.PREVENTIVO,
        status: MaintenanceStatusType.PROGRAMADO,
        equipment: equipment._id,
        equipment_serial_number: equipment.serial_number,
        equipment_name: equipment.name,
        equipment_type: equipment.equipment_type,
        date: expectedNextDate,
        description: 'Mantenimiento preventivo generado automáticamente.',
      });

      this.logger.log(`Mantenimiento preventivo generado para ${equipment.name} (fecha: ${expectedNextDate.toISOString()})`);

      // Actualizamos el próximo mantenimiento (para optimizar futuras consultas)
      const nextDate = new Date(expectedNextDate);

      nextDate.setDate(nextDate.getDate() + equipment.maintenance_interval_days);
      equipment.next_maintenance_date = nextDate;

      await equipment.save();
    }

    this.logger.log('Finalizó la ejecución del cron de mantenimiento preventivo.');
  }
}
