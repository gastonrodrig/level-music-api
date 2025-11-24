import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UploadResult } from 'src/core/interfaces';
import { EventSubtaskEvidence } from '../schema'; 
import { StorageService } from 'src/modules/firebase/services';
import { CreateTaskEvidenceDto } from '../dto';

@Injectable()
export class TaskEvidenceService {
  constructor(
    @InjectModel(EventSubtaskEvidence.name)
    private taskEvidenceModel: Model<EventSubtaskEvidence>,
    private readonly storageService: StorageService,
  ) {}

  async createFromFiles(
  subtaskId: string, 
  files: Express.Multer.File[], 
  workerId?: string
): Promise<EventSubtaskEvidence[]> {
  try {
    if (!files || !files.length) return [];
    
    const uploaded = (await this.storageService.uploadMultipleFiles(
      'event-tasks', files, 'evidences'
    )) as UploadResult[];

    const docs = uploaded.map(u => ({
      event_subtask_id: new Types.ObjectId(subtaskId), // <-- Cambiado
      worker_id: workerId ? new Types.ObjectId(workerId) : null,
      file_url: u?.url,
    }));
    
    const created = await this.taskEvidenceModel.insertMany(docs);
    return created;
  } catch (error) {
    throw new InternalServerErrorException(`Error uploading evidences: ${error.message}`);
  }
}

async findBySubtaskId(subtaskIds: string[]): Promise<EventSubtaskEvidence[]> {
  const objectIds = subtaskIds
    .filter(Boolean)
    .map(id => {
      try { return new Types.ObjectId(id); } catch { return null; }
    })
    .filter(Boolean) as Types.ObjectId[];

  return await this.taskEvidenceModel
    .find({ event_subtask_id: { $in: objectIds } }) // <-- Cambiado
    .lean()
    .exec();
}

  async removeEvidence(evidenceId: string) {
    // opcional: borrar del storage antes de eliminar DB
    return this.taskEvidenceModel.findByIdAndDelete(evidenceId).exec();
  }


  async deleteManyByIds(ids: string[]): Promise<boolean> {
    if (!ids || ids.length === 0) return false;

    // 1. Buscar las evidencias para obtener sus URLs antes de borrarlas
    const evidencesToDelete = await this.taskEvidenceModel.find({
      _id: { $in: ids.map(id => new Types.ObjectId(id)) }
    });

    if (evidencesToDelete.length === 0) return false;

    // 2. Extraer URLs para borrar de Firebase
    const urlsToDelete = evidencesToDelete
      .map(e => e.file_url)
      .filter(url => !!url); // Filtrar nulos por seguridad

    // 3. Borrar de Firebase (Storage)
    if (urlsToDelete.length > 0) {
      // Usamos el método deleteFiles que ya tienes en tu StorageService
      await this.storageService.deleteFiles(urlsToDelete);
    }

    // 4. Borrar documentos de MongoDB
    await this.taskEvidenceModel.deleteMany({
      _id: { $in: ids.map(id => new Types.ObjectId(id)) }
    });

    return true;
  }

}