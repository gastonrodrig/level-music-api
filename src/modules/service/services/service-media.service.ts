import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ServiceMedia } from "../schema";
import { UploadResult } from 'src/core/interfaces';
import { Model, Types } from 'mongoose';
import { StorageService } from "src/modules/firebase/services";
import { ServiceDetail } from "../schema";

@Injectable()
export class MediaServiceService {
constructor(
    @InjectModel(ServiceMedia.name)
    private serviceMediaModel: Model<ServiceMedia>,
    @InjectModel(ServiceDetail.name)
    private serviceDetailModel: Model<ServiceDetail>,
    private readonly storageService: StorageService,
) {}

async createMediaForService( 
    serviceDetailId: string,
    files: Express.Multer.File[],
  ): Promise<ServiceMedia[]> {
    try{

    const uploadedFiles = (await this.storageService.uploadMultipleFiles(
      'service-detail-media',
      files,
      'services-details'
    )) as UploadResult[];
    const mediaDocs = uploadedFiles.map(file => ({
      url: file.url,
      name: file.name,
      size: file.size,
      storage_path: file.storagePath,
      service_detail: new Types.ObjectId(serviceDetailId),
    }));
    const created = await this.serviceMediaModel.insertMany(mediaDocs);
    return created;
  } catch (error) {
    throw new InternalServerErrorException(`Error creating media for service: ${error.message}`);
  }

}
async findByServiceDetailId(serviceDetailId: string): Promise<ServiceMedia[]> {
    // Busca por 'service_detail' (como en tu esquema)
    return this.serviceMediaModel.find({ service_detail: serviceDetailId }).exec(); 
  }

async deleteMedia(mediaIds: string[]): Promise<void> {
    try {
      if (!mediaIds || mediaIds.length === 0) return;

      const objectIds = mediaIds.map(id => new Types.ObjectId(id));

      // 1. Encontrar los documentos de media para obtener sus rutas
      const mediaDocs = await this.serviceMediaModel.find({ _id: { $in: objectIds } });
      if (!mediaDocs.length) return;

      // 2. Obtener las rutas de Firebase/Storage
      const pathsToDelete = mediaDocs
        .map(doc => doc.storage_path)
        .filter(path => !!path); // Filtra por si alguna no tiene path

      // 3. Borrar de Firebase/Storage (asumiendo que tu servicio tiene un método 'deleteFile')
      if (pathsToDelete.length > 0) {
        // (Si tienes 'deleteMultipleFiles', úsalo. Si no, un bucle está bien)
        const deletePromises = pathsToDelete.map(path => 
          this.storageService.deleteFile(path) 
        );
        await Promise.all(deletePromises);
      }

      // 4. Quitar la referencia del array 'photos' en los ServiceDetail
      //    (Agrupamos por si las fotos pertenecen a diferentes detalles)
      const parentUpdates = new Map<string, Types.ObjectId[]>();
      for (const doc of mediaDocs) {
        if (doc.service_detail) {
          const parentId = doc.service_detail.toString();
          if (!parentUpdates.has(parentId)) {
            parentUpdates.set(parentId, []);
          }
          parentUpdates.get(parentId).push(doc._id);
        }
      }

      // 5. Ejecutar el $pull en cada padre
      const updatePromises = [];
      parentUpdates.forEach((idsToPull, parentId) => {
        updatePromises.push(
          this.serviceDetailModel.updateOne(
            { _id: new Types.ObjectId(parentId) },
            { $pull: { photos: { $in: idsToPull } } } // <-- Mongoose quita los IDs del array 'photos'
          )
        );
      });
      await Promise.all(updatePromises);

      // 6. Finalmente, borrar los documentos de la colección 'service-media'
      await this.serviceMediaModel.deleteMany({ _id: { $in: objectIds } });

    } catch (error) {
      throw new InternalServerErrorException(`Error deleting media: ${error.message}`);
    }
  }



}
