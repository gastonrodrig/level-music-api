import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export const TransformObjectId = () =>
  Transform(({ value }) => (Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value));
