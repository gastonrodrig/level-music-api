import { Query, Document } from 'mongoose';

export const cleanMongooseQueryResponse = <T extends Document>(query: Query<T | T[], T>) => {
  return query.select('-__v -_id').lean();
}; 

export function cleanMongooseDocumentResponse(response: Document | Document[]) {
  const cleanDoc = (doc: Document) => {
    const obj = doc.toObject();
    delete obj._id;
    delete obj.__v;
    return obj;
  };

  if (Array.isArray(response)) {
    return response.map(cleanDoc);
  }
  return cleanDoc(response);
}