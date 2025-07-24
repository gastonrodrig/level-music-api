import { Types } from 'mongoose';

export const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (Types.ObjectId.isValid(id) && typeof id === 'string') {
    return new Types.ObjectId(id);
  }
  // ya es ObjectId o string inválido: intentar castear igualmente
  return (id as Types.ObjectId) ?? new Types.ObjectId(id as any);
};
