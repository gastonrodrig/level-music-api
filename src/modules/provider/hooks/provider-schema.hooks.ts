import { Connection } from 'mongoose';
import { Service } from 'src/modules/service/schema';

export function addProviderHooks(schema: any, connection: Connection) {
  // Auditoría: updated_at
  schema.pre('save', function (next: any) {
    this.updated_at = new Date();
    next();
  });

  schema.pre('findOneAndUpdate', function (next: any) {
    this.set({ updated_at: new Date() });
    next();
  });

  // Denormalización: actualizar los Services
  const ServiceModel = connection.model<Service>(Service.name);

  schema.post('findOneAndUpdate', async function (doc: any) {
    if (!doc) return;
    await ServiceModel.updateMany(
      { provider: doc._id },
      { $set: { provider_name: doc.name } }
    );
  });
}
