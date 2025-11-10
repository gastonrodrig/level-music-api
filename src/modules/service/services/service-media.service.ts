import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UploadResult } from 'src/core/interfaces';
import { Model, Types } from 'mongoose';
import { StorageService } from "src/modules/firebase/services";
import { ServiceDetail } from "../schema";
import { toObjectId } from "src/core/utils";
import { ServiceMedia } from "src/modules/uploads";

@Injectable()
export class ServiceMediaService {
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

  async deleteMedia(mediaIds: string[]): Promise<void> {
    try {
      if (!mediaIds || mediaIds.length === 0) return;

      const objectIds = mediaIds.map(id => toObjectId(id));

      // Encontrar los documentos de media para obtener sus rutas
      const mediaDocs = await this.serviceMediaModel.find({ _id: { $in: objectIds } });

      // Obtener las rutas de Firebase/Storage
      const pathsToDelete = mediaDocs.map(doc => doc.storage_path).filter(path => !!path); 

      // Borrar de Firebase/Storage
      if (pathsToDelete.length > 0) {
        const deletePromises = pathsToDelete.map(path => 
          this.storageService.deleteFile(path) 
        );
        await Promise.all(deletePromises);
      }

      // Agrupa las imágenes que están dentro de mediaDocs,
      // únicamente las que se van a eliminar.
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

      // Ejecuta el $pull en cada padre, para eliminar las referencias a las imágenes borradas
      const updatePromises = [];
      parentUpdates.forEach((idsToPull, parentId) => {
        updatePromises.push(
          this.serviceDetailModel.updateOne(
            { _id: new Types.ObjectId(parentId) },
            { $pull: { photos: { $in: idsToPull } } } 
          )
        );
      });
      await Promise.all(updatePromises);

      // Borrar los documentos de la colección 'service-media'
      await this.serviceMediaModel.deleteMany({ _id: { $in: objectIds } });

    } catch (error) {
      throw new InternalServerErrorException(`Error deleting media: ${error.message}`);
    }
  }
}