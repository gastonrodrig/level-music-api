import { Worker, WorkerSchema } from '../schema';

export function addWorkerTypeHooks(schema: any, connection: any) {
  schema.pre('save', function (next: any) {
    this.updated_at = new Date();
    next();
  });

  schema.pre('findOneAndUpdate', function (next: any) {
    this.set({ updated_at: new Date() });
    next();
  });

  const WorkerModel = connection.model(Worker, WorkerSchema);

  schema.post('findOneAndUpdate', async function (doc: any) {
    if (!doc) return;
    await WorkerModel.updateMany(
      { worker_type: doc._id },
      { worker_type_name: doc.name }
    );
  });
}
