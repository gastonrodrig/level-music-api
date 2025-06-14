import { Connection } from 'mongoose';
import { Maintenance } from '../schema';

export function addResourceHooks(schema: any, connection: Connection) {
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

  schema.post('findOneAndUpdate', async function (doc: any) {
    if (!doc) return;
    await MaintenanceModel.updateMany(
      { resource: doc._id },
      { $set: { resource_name: doc.name } }
    );
  });
}
