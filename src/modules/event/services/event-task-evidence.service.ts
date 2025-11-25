import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UploadResult } from 'src/core/interfaces';
import { EventSubtaskEvidence } from '../schema'; 
import { StorageService } from 'src/modules/firebase/services';

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
        event_subtask_id: new Types.ObjectId(subtaskId),
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
      .find({ event_subtask_id: { $in: objectIds } })
      .lean()
      .exec();
  }
}