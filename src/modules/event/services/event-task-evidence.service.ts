import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UploadResult } from 'src/core/interfaces';
import { TaskEvidence } from '../schema/event-task-evidence.schema'; 
import { StorageService } from 'src/modules/firebase/services';
import { CreateTaskEvidenceDto } from '../dto';
@Injectable()
export class TaskEvidenceService {
  constructor(
    @InjectModel(TaskEvidence.name)
    private taskEvidenceModel: Model<TaskEvidence>,
    private readonly storageService: StorageService,
  ) {}

  async createFromFiles(taskId: string, 
    files: Express.Multer.File[], 
    workerId?: string): Promise<TaskEvidence[]> {
    try {
      if (!files || !files.length) return [];
      const filesEvidence = files;
        
      const uploaded = (await this.storageService.uploadMultipleFiles(
        'event-tasks', filesEvidence, 'evidences'
      )) as UploadResult[];

      const docs = uploaded.map(u => ({
        event_task_id: new Types.ObjectId(taskId),
        worker_id: workerId ? new Types.ObjectId(workerId) : null,
        file_url: u?.url,
      }));
      const created = await this.taskEvidenceModel.insertMany(docs);
      return created;
    } catch (error) {
      throw new InternalServerErrorException(`Error uploading evidences: ${error.message}`);
    }
  }
  async findByTaskId(taskIds: string[]): Promise<TaskEvidence[]> {
    const objectIds = taskIds
      .filter(Boolean)
      .map(id => {
        try { return new Types.ObjectId(id); } catch { return null; }
      })
      .filter(Boolean) as Types.ObjectId[];

    return await this.taskEvidenceModel
      .find({ event_task_id: { $in: objectIds } })
      .lean()
      .exec();
  }

  async removeEvidence(evidenceId: string) {
    // opcional: borrar del storage antes de eliminar DB
    return this.taskEvidenceModel.findByIdAndDelete(evidenceId).exec();
  }
}