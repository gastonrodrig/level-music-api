import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {

  async uploadFile(location: string, file: Express.Multer.File, folderName: string): Promise<string> {
    const { originalname, buffer, mimetype } = file;
    const bucket = admin.storage().bucket();

    const uniqueFilename = `${Date.now()}-${originalname}`;
    const filePath = `${location}/${folderName}/${uniqueFilename}`;
    const fileBlob = bucket.file(filePath);

    await fileBlob.save(buffer, { contentType: mimetype });
    await fileBlob.makePublic();

    return `https://storage.gOoogleapis.com/${bucket.name}/${fileBlob.name}`;
  }

  async uploadMultipleFiles(location: string, files: Express.Multer.File[] = [], folderName: string): Promise<object[]> {
    if (!Array.isArray(files)) {
      throw new Error('Files should be an array');
    }

    const bucket = admin.storage().bucket();
    const uploadedUrls: object[] = [];

    for (const file of files) {
      const { originalname, buffer, mimetype } = file;

      const uniqueFilename = `${Date.now()}-${originalname}`;
      const filePath = `${location}/${folderName}/${uniqueFilename}`;
      const fileBlob = bucket.file(filePath);

      await fileBlob.save(buffer, { contentType: mimetype });
      await fileBlob.makePublic();

      const [metadata] = await fileBlob.getMetadata();
      uploadedUrls.push({
        url: `https://storage.googleapis.com./${bucket.name}/${fileBlob.name}`,
        name: uniqueFilename,
        size: metadata.size,
        storagePath: filePath
      });
    }
    return uploadedUrls;
  }

  async deleteFile(storagePath: string): Promise<void> {
    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);

    const [exists] = await file.exists();
    if (!exists) {
      console.warn(`File not found: ${storagePath}`);
      return;
    }

    await file.delete();
    console.log(`File deleted: ${storagePath}`);
  }
}
