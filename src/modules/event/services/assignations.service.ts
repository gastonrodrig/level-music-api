import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignation } from '../schema';
import { CreateAssignationDto, UpdateAssignationDto } from '../dto';
import { SF_ASSIGNATION } from 'src/core/utils';
import { errorCodes } from 'src/core/common';

@Injectable()
export class AssignationsService {
  constructor(
    @InjectModel(Assignation.name)
    private assignationModel: Model<Assignation>,
  ) {}

  async create(createAssignationDto: CreateAssignationDto): Promise<Assignation> {
    try {
      // Validar que las horas de disponibilidad sean válidas
      if (createAssignationDto.available_from >= createAssignationDto.available_to) {
        throw new BadRequestException(
          'La hora de inicio debe ser menor que la hora de fin',
        );
      }

      // Validar que no exista ya una asignación duplicada
      const existingAssignation = await this.assignationModel.findOne({
        day_of_week: createAssignationDto.day_of_week,
        available_from: createAssignationDto.available_from,
        available_to: createAssignationDto.available_to,
        event: createAssignationDto.event,
        worker: createAssignationDto.worker,
        resource: createAssignationDto.resource,
      });

      if (existingAssignation) {
        throw new HttpException(
          {
            code: errorCodes.ASSIGNATION_ALREADY_EXISTS,
            message: 'Ya existe una asignación con estos parámetros.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const assignation = await this.assignationModel.create({
        available_from: createAssignationDto.available_from,
        available_to: createAssignationDto.available_to,
        day_of_week: createAssignationDto.day_of_week,
        resource_type: createAssignationDto.resource_type,
        
      });

      return await assignation.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error creating assignation: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    limit = 5,
    offset = 0,
    search = '',
    sortField: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; items: Assignation[] }> {
    try {
      const filter = search
        ? {
            $or: SF_ASSIGNATION.map((field) => ({
              [field]: { $regex: search, $options: 'i' },
            })),
          }
        : {};

      const sortObj: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        this.assignationModel
          .find(filter)
          .populate('event', 'name')
          .populate('worker', 'name')
          .populate('resource', 'name serial_number')
          .sort(sortObj)
          .skip(offset)
          .limit(limit)
          .exec(),
        this.assignationModel.countDocuments(filter).exec(),
      ]);

      return { total, items };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding assignations: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<Assignation> {
    try {
      const assignation = await this.assignationModel
        .findById(id)
        .populate('event', 'name status')
        .populate('worker', 'name email phone')
        .populate('resource', 'name serial_number resource_type status')
        .exec();

      if (!assignation) {
        throw new NotFoundException('Asignación no encontrada');
      }

      return assignation;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error finding assignation: ${error.message}`,
      );
    }
  }

  async update(id: string, updateAssignationDto: UpdateAssignationDto): Promise<Assignation> {
    try {
      // Validar horas si se actualizan
      if (updateAssignationDto.available_from && updateAssignationDto.available_to) {
        if (updateAssignationDto.available_from >= updateAssignationDto.available_to) {
          throw new BadRequestException(
            'La hora de inicio debe ser menor que la hora de fin',
          );
        }
      }

      const updateData = {
        ...(updateAssignationDto.day_of_week && { day_of_week: updateAssignationDto.day_of_week }),
        ...(updateAssignationDto.resource_type && { resource_type: updateAssignationDto.resource_type }),
        ...(updateAssignationDto.available_from && { available_from: updateAssignationDto.available_from }),
        ...(updateAssignationDto.available_to && { available_to: updateAssignationDto.available_to }),
      };

      const updatedAssignation = await this.assignationModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('event', 'name status')
        .populate('worker', 'name email')
        .populate('resource', 'name serial_number')
        .exec();

      if (!updatedAssignation) {
        throw new NotFoundException('Asignación no encontrada');
      }

      return updatedAssignation;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error updating assignation: ${error.message}`,
      );
    }
  }
}