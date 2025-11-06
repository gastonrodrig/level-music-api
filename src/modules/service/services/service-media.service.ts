import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ServiceMedia } from "../schema";
import { UploadResult } from 'src/core/interfaces';
import { Model, Types } from 'mongoose';
import { StorageService } from "src/modules/firebase/services";

@Injectable()
export class MediaServiceService {
constructor(
    @InjectModel(ServiceMedia.name)
    private serviceMediaModel: Model<ServiceMedia>,
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
async findByServiceId(serviceId: string): Promise<ServiceMedia[]> {
    return this.serviceMediaModel.find({ service: serviceId }).exec();
    }

}
