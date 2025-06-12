import { Connection } from 'mongoose';
import { Service } from '../schema/service.schema';

export function addProviderHooks(providerSchema: any, connection: Connection) {
  const ServiceModel = connection.model<Service>(Service.name);

  providerSchema.post('findOneAndUpdate', async function (doc) {
    if (!doc) return;
    await ServiceModel.updateMany(
      { provider: doc._id.toString() },
      { $set: { provider_name: doc.name } }
    );
  });
}

export function addServiceTypeHooks(serviceTypeSchema: any, connection: Connection) {
  const ServiceModel = connection.model<Service>(Service.name);

  serviceTypeSchema.post('findOneAndUpdate', async function (doc) {
    if (!doc) return;
    await ServiceModel.updateMany(
      { service_type: doc._id.toString() },
      { $set: { service_type_name: doc.name } }
    );
  });
}