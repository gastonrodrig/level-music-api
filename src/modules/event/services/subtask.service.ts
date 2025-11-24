import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventSubtask } from '../schema';
import { TaskEvidenceService } from './event-task-evidence.service';
import { UpdateSubtaskDto } from '../dto';
import { TaskStatusType } from '../enum';

@Injectable()
export class EventSubtaskService {
  constructor(
    @InjectModel(EventSubtask.name)
    private eventSubtaskModel: Model<EventSubtask>,
    private readonly taskEvidenceService: TaskEvidenceService,
  ) {}

  async updateSubtask(
    subtaskId: string,
    dto: UpdateSubtaskDto,
    files?: Express.Multer.File[],
    workerId?: string, // <--- Recibimos esto del controlador
  ): Promise<EventSubtask> {
    try {
     const subtask = await this.eventSubtaskModel.findById(subtaskId);
      if (!subtask) throw new NotFoundException('Subtask not found');

      // --- 1. PROCESAR ELIMINACIONES (NUEVO) ---
      if (dto.deleted_evidence_ids && dto.deleted_evidence_ids.length > 0) {
        
        // A. Borrar de Firebase y de la colección 'subtask-evidences'
        await this.taskEvidenceService.deleteManyByIds(dto.deleted_evidence_ids);

        // B. Quitar las referencias del array del padre 'EventSubtask'
        // Usamos $pull para sacar esos IDs del array
        await this.eventSubtaskModel.updateOne(
          { _id: subtaskId },
          { 
            $pull: { 
              evidences: { $in: dto.deleted_evidence_ids.map(id => new Types.ObjectId(id)) } 
            } 
          }
        );
      }
      // ------------------------------------------

      // 2. Actualizar textos (Status / Notas)
      if (dto.status) {
        subtask.status = dto.status;
        if (dto.status === TaskStatusType.COMPLETADO) {
          subtask.completed_at = new Date();
        }
      }
      if (dto.notas !== undefined) {
        subtask.notas = dto.notas;
      }

      // 3. Procesar NUEVOS archivos (tu lógica existente)
      if (files && files.length > 0) {
        const finalWorkerId = workerId || subtask.worker?.toString();
        if (!finalWorkerId) {
           throw new BadRequestException('Worker ID requerido');
        }
        
        const newEvidences = await this.taskEvidenceService.createFromFiles(
          subtaskId,
          files,
          finalWorkerId,
        );
        
        const evidenceIds = newEvidences.map(e => e._id as Types.ObjectId);
        // Usamos push en el objeto local o guardamos directo
        // Nota: Como hicimos un updateOne arriba ($pull), es mejor recargar el objeto o usar updateOne con $push abajo.
        // Pero para mantener tu lógica de save(), lo haremos así:
        
        // Si acabamos de borrar, el array 'subtask.evidences' en memoria sigue teniendo los viejos.
        // Filtramos los borrados de la memoria local para evitar inconsistencias al hacer .save()
        if (dto.deleted_evidence_ids) {
            subtask.evidences = subtask.evidences.filter(
                id => !dto.deleted_evidence_ids.includes(id.toString())
            );
        }

        subtask.evidences = [...subtask.evidences, ...evidenceIds];
      }

      // 4. Guardar cambios
      await subtask.save();

      return await this.eventSubtaskModel
      .findById(subtaskId)
      .populate('evidences') // <-- Esto agrega los datos completos de las evidencias
      .lean()
      .exec();
      
    } catch (error) {
      throw new InternalServerErrorException(`Error updating subtask: ${error.message}`);
    }
  }

  async findById(subtaskId: string): Promise<EventSubtask> {
    const subtask = await this.eventSubtaskModel
      .findById(subtaskId)
      .populate('evidences')
      .lean()
      .exec();
    
    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }
    
    return subtask;
  }
}