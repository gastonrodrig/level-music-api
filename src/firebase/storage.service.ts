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

    return `https://storage.googleapis.com/${bucket.name}/${fileBlob.name}`;
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
        nombre: uniqueFilename,
        url: `https://storage.googleapis.com/${bucket.name}/${fileBlob.name}`,
        tamanio: metadata.size,
      });
    }
    return uploadedUrls;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const bucket = admin.storage().bucket();
    const filePath = fileUrl.replace(
      `https://storage.googleapis.com/${bucket.name}/`,
      '',
    );
    const file = bucket.file(filePath);

    const [exists] = await file.exists();

    if (exists) {
      await file.delete();
      console.log(`File deleted: ${filePath}`);
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  }
}
