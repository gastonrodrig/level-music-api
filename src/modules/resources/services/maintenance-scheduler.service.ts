import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, Maintenance } from '../schema';
import { MaintenanceType, MaintenanceStatusType, ResourceStatusType } from '../enum';
import { getCurrentDateNormalized } from 'src/core/utils';

@Injectable()
export class PreventiveMaintenanceSchedulerService {
  private readonly logger = new Logger(PreventiveMaintenanceSchedulerService.name);

  constructor(
    @InjectModel(Resource.name)
    private resourceModel: Model<Resource>,
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<Maintenance>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handlePreventiveMaintenance() {
    this.logger.log('🔧 Iniciando revisión automática de mantenimientos preventivos...');

    const today = new Date(getCurrentDateNormalized());

    const resources = await this.resourceModel.find({
      status: ResourceStatusType.DISPONIBLE,
    });

    for (const resource of resources) {
      // Obtenemos la base de cálculo: último mantenimiento
      const baseDate = resource.last_maintenance_date;

      // Calculamos la fecha esperada para el siguiente mantenimiento
      const expectedNextDate = new Date(baseDate);

      expectedNextDate.setDate(expectedNextDate.getDate() + resource.maintenance_interval_days - 7);

      // Si aún no le toca, lo saltamos
      if (expectedNextDate > today) {
        this.logger.log(`Recurso ${resource.name} aún no requiere mantenimiento preventivo.`);
        continue;
      }

      // Validamos que no exista ya un mantenimiento pendiente
      const existingMaintenance = await this.maintenanceModel.findOne({
        resource: resource._id,
        status: { $in: [MaintenanceStatusType.EN_PROGRESO, MaintenanceStatusType.PROGRAMADO] },
      });

      if (existingMaintenance) {
        this.logger.warn(`Ya existe un mantenimiento preventivo pendiente para ${resource.name}.`);
        continue;
      }

      // Generamos el mantenimiento preventivo
      await this.maintenanceModel.create({
        type: MaintenanceType.PREVENTIVO,
        status: MaintenanceStatusType.PROGRAMADO,
        resource: resource._id,
        resource_serial_number: resource.serial_number,
        resource_name: resource.name,
        resource_type: resource.resource_type,
        date: expectedNextDate,
        description: 'Mantenimiento preventivo generado automáticamente.',
      });

      this.logger.log(`Mantenimiento preventivo generado para ${resource.name} (fecha: ${expectedNextDate.toISOString()})`);

      // Actualizamos el próximo mantenimiento (para optimizar futuras consultas)
      const nextDate = new Date(expectedNextDate);

      nextDate.setDate(nextDate.getDate() + resource.maintenance_interval_days);
      resource.next_maintenance_date = nextDate;

      await resource.save();
    }

    this.logger.log('Finalizó la ejecución del cron de mantenimiento preventivo.');
  }
}
