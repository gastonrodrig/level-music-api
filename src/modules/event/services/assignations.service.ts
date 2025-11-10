import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assignation } from '../schema';
import { CreateAssignationDto } from '../dto';
import { Event } from 'src/modules/event/schema/event.schema';
import { errorCodes } from 'src/core/common';
import { ResourceType } from '../enum';
import { Equipment } from 'src/modules/equipments/schema';
import { Worker } from 'src/modules/worker/schema/worker.schema';
import { ServiceDetail } from 'src/modules/service/schema/service-detail.schema';
import { Service } from 'src/modules/service/schema/service.schema';
import { toObjectId } from 'src/core/utils';

@Injectable()
export class AssignationsService {
  constructor(
    @InjectModel(Assignation.name)
    private readonly assignationModel: Model<Assignation>,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
    @InjectModel(Equipment.name)
    private readonly equipmentModel: Model<Equipment>,
    @InjectModel(Worker.name)
    private readonly workerModel: Model<Worker>,
    @InjectModel(ServiceDetail.name)
    private readonly serviceDetailModel: Model<ServiceDetail>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
  ) {}

  async validateResourceAvailability(
    resource_id: string,
    available_from: Date,
    available_to: Date,
    excluded_event_code?: string
  ): Promise<void> {
    const query: any ={
      resource: toObjectId(resource_id),
      $or: [
        {
          available_from: { $lt: available_to },
          available_to: { $gt: available_from },
        },
      ],
    };

    if (excluded_event_code) {
      // Busca el listado de todos los eventos que comparten ese código, y exclúyelos
      const eventsToExclude = await this.eventModel
        .find({ event_code: excluded_event_code })
        .select('_id');
      query.event = { $nin: eventsToExclude.map((e) => e._id) };
    }

    const conflict = await this.assignationModel.findOne(query);

    if (conflict) {
      throw new HttpException(
        {
          code: errorCodes.RESOURCE_ALREADY_ASSIGNED,
          message: 'El recurso ya está ocupado en ese rango de horario.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(dto: CreateAssignationDto): Promise<Assignation> {
    try {
      // 1. Validar que el evento exista
      const event = await this.eventModel.findById(dto.event_id);
      if (!event) throw new BadRequestException(`El evento no existe.`);

      // 2. Validar conflictos de horario
      await this.validateResourceAvailability(
        dto.resource_id,
        dto.available_from,
        dto.available_to,
        event.event_code
      );

      // 3. Construir objeto base
      const assignationToCreate: any = {
        ...dto,
        event: event._id,
        resource: toObjectId(dto.resource_id),
        assigned_at: new Date(),
      };

      // 4. Agregar info extra según tipo
      if (dto.resource_type === ResourceType.EQUIPMENT) {
        const equipment = await this.equipmentModel.findById(dto.resource_id);
        if (!equipment) {
          throw new BadRequestException(`El equipo "${dto.resource_id}" no existe.`);
        }

        assignationToCreate.equipment_name = equipment.name;
        assignationToCreate.equipment_description = equipment.description;
        assignationToCreate.equipment_type = equipment.equipment_type;
        assignationToCreate.equipment_serial_number = equipment.serial_number;
        assignationToCreate.equipment_status = equipment.status;
        assignationToCreate.equipment_location = equipment.location;
      }

      if (dto.resource_type === ResourceType.WORKER) {
        const worker = await this.workerModel.findById(dto.resource_id);
        if (!worker) {
          throw new BadRequestException(`El trabajador "${dto.resource_id}" no existe.`);
        }

        assignationToCreate.worker_role = worker.worker_type_name;
        assignationToCreate.worker_status = worker.status;
        assignationToCreate.worker_first_name = worker.first_name;
        assignationToCreate.worker_last_name = worker.last_name;
      }

      if (dto.resource_type === ResourceType.SERVICE_DETAIL) {
        const serviceDetail = await this.serviceDetailModel.findById(dto.resource_id);
        if (!serviceDetail) {
          throw new BadRequestException(`El service-detail "${dto.resource_id}" no existe.`);
        }

        const service = await this.serviceModel.findById(serviceDetail.service_id);
        if (!service) {
          throw new BadRequestException(`El service padre del service_detail no existe.`);
        }

        assignationToCreate.service_detail = serviceDetail.details;
        assignationToCreate.service_ref_price = serviceDetail.ref_price;
        assignationToCreate.service_provider_email = service.provider_email;
        assignationToCreate.service_provider_name = service.provider_name;
        assignationToCreate.service_type_name = service.service_type_name;
        assignationToCreate.service_status = serviceDetail.status;
      }

      // 5. Guardar asignación
      const newAssignation = new this.assignationModel(assignationToCreate);
      return await newAssignation.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Error creating assignation: ${error.message}`,
      );
    }
  }
}
