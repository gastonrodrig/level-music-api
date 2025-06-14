import { Connection } from 'mongoose';
import { Service } from '../schema';

export function addServiceTypeHooks(schema: any, connection: Connection) {
  schema.pre('save', function (next: any) {
    this.updated_at = new Date();
    next();
  });

  schema.pre('findOneAndUpdate', function (next: any) {
    this.set({ updated_at: new Date() });
    next();
  });

  const ServiceModel = connection.model<Service>(Service.name);
  
  schema.post('findOneAndUpdate', async function (doc: any) {
    if (!doc) return;
    await ServiceModel.updateMany(
      { service_type: doc._id },
      { $set: { service_type_name: doc.name } }
    );
  });
}
