import { Connection } from 'mongoose';
import { User } from 'src/modules/user/schema';

export function addWorkerHooks(schema: any, connection: Connection) {
  schema.pre('save', function (next: any) {
    this.updated_at = new Date();
    next();
  });

  schema.pre('findOneAndUpdate', function (next: any) {
    this.set({ updated_at: new Date() });
    next();
  });

  const UserModel = connection.model<User>(User.name);

  schema.post('findOneAndUpdate', async function (doc: any) {
    if (!doc) return;

    await UserModel.findByIdAndUpdate(
      doc.user,
      {
        $set: {
          first_name: doc.first_name,
          last_name: doc.last_name,
          role: doc.role,
          status: doc.status,
        },
      }
    );
  });
}
