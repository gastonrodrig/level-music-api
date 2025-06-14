import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDetail } from '../schema';
import { Model, Types } from 'mongoose';
import { CreateServiceDetailDto } from '../dto'; 
import { ServiceDetailMedia } from 'src/modules/uploads';
import { StorageService } from 'src/modules/firebase/services/storage.service';

@Injectable()
export class ServiceDetailService {
  constructor(
    @InjectModel(ServiceDetail.name)
    private serviceDetailModel: Model<ServiceDetail>,
    @InjectModel(ServiceDetailMedia.name)
    private serviceDetailMediaModel: Model<ServiceDetailMedia>,
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
    private storageService: StorageService,
  ) {}

  async create(createServiceDetailDto: CreateServiceDetailDto): Promise<ServiceDetail> {
    try {
      const service = await this.serviceModel.findById(createServiceDetailDto.service_id);
      if (!service) throw new NotFoundException('Service not found');

      const newServiceDetail = new this.serviceDetailModel({
        ...createServiceDetailDto,
        service: service._id,
      });

      return await newServiceDetail.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error creating service detail: ${error.message}`);
    }
  }

  async updateMedia(detailId: string, files: Express.Multer.File[]): Promise<ServiceDetail> {
    try {
      // Validamos que el detalle exista
      const detail = await this.serviceDetailModel
        .findById(detailId)
        .populate('multimedia');
      if (!detail) {
        throw new NotFoundException('ServiceDetail no encontrado');
      }

      // Se borran los archivos de storage y de cada documento de la coleccion
      if (Array.isArray(detail.multimedia) && detail.multimedia.length) {
        for (const old of detail.multimedia as ServiceDetailMedia[]) {
          console.log(`Intentando eliminar archivo: ${old.storagePath}`);
          await this.storageService.deleteFile(old.storagePath);
          await this.serviceDetailMediaModel.deleteOne({ _id: old._id }).exec();
        }
      }
      detail.multimedia = [];

      // Se suben todos los archivos
      const uploads = await this.storageService.uploadMultipleFiles(
        'service-detail',
        files,
        detailId,
      );

      // Se crea un documento por cada upload y se guarda
      const newMediaDocs: ServiceDetailMedia[] = [];
      for (const u of uploads) {
        const media = new this.serviceDetailMediaModel({
          url: u['url'],
          name: u['name'],
          size: u['size'],
          storagePath: u['storagePath'],
          detail_id: new Types.ObjectId(detail._id),
        });
        await media.save();
        newMediaDocs.push(media);
      }

      // Asociamos el array y persistimos el detalle
      detail.multimedia = newMediaDocs;
      return await detail.save();
    } catch (error) {
      throw new InternalServerErrorException(`Error creating updating service media detail: ${error.message}`);
    }
  }

  async getServiceDetailsByServiceId(serviceId: string): Promise<ServiceDetail[]> {
    try {
      const serviceDetails = await this.serviceDetailModel
        .find({ service_id: serviceId })
        .populate('multimedia');
      if (!serviceDetails || serviceDetails.length === 0) {
        throw new NotFoundException('No se encontraron detalles para el ID de servicio proporcionado');
      }
      return serviceDetails;
    } catch (error) {
      throw new InternalServerErrorException(`Error obteniendo detalles de servicio: ${error.message}`);
    }
  }
}
