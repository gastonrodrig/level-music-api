import { Connection } from 'mongoose';
import { Maintenance } from '../schema';

export function addEquipmentHooks(schema: any, connection: Connection) {
  // Hook de auditoría (updated_at)
  schema.pre('save', function (next: any) {
    this.updated_at = new Date();
    next();
  });

  schema.pre('findOneAndUpdate', function (next: any) {
    this.set({ updated_at: new Date() });
    next();
  });

  // Hook de denormalización (actualizar mantenimientos)
  const MaintenanceModel = connection.model<Maintenance>(Maintenance.name);

  schema.post('save', async function (doc: any) {
    if (!doc) return;
    await MaintenanceModel.updateMany(
      { equipment: doc._id },
      {
        $set: {
          equipment_serial_number: doc.serial_number,
          equipment_name: doc.name,
          equipment_type: doc.equipment_type
        }
      }
    );
  });
}
