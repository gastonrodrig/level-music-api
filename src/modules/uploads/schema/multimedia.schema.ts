import { Schema } from 'mongoose';

export const MultimediaSchema = new Schema({
  url: { type: String },
  name: { type: String },
  mimetype: { type: String },
  size: { type: Number }
}, { _id: false });
