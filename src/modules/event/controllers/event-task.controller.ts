import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { EventTaskService } from '../services/event-task.service';
import { CreateEventTaskDto, UpdateEventTaskDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { get } from 'mongoose';
import { FileFieldsInterceptor } from '@nestjs/platform-express';


@Controller('event-tasks')
@ApiTags('Event-Task')
export class EventTaskController {
  constructor(private readonly eventTaskService: EventTaskService) {}

 
  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva tarea de evento (acepta archivos multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event_id: { type: 'string' },
        worker_type_id: { type: 'string' },
        worker_id: { type: 'string' },
        title: { type: 'string' },
        notes: { type: 'string' },
        status: { type: 'string' },
        phase: { type: 'string' },
        requires_evidence: { type: 'boolean' },
        event_type_id: { type: 'string' },
        // archivos: field 'files' como array de binario
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['event_id', 'worker_type_id', 'title'],
    },
  })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  create(
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Body() createEventTaskDto: CreateEventTaskDto,
  ) {
    return this.eventTaskService.create(createEventTaskDto, files?.files ?? []);
  }
  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una tarea de evento por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tarea de evento encontrada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener la tarea de evento.',
  })
  findOne(@Param('id') id: string) {
    return this.eventTaskService.findOne(id);
  }

  @Get('/event/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Obtener tareas de un evento por ID de evento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tareas de evento obtenidas correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener las tareas de evento.',
  })
  findByEvent(
    @Param('id') id: string,
  ) {
    return this.eventTaskService.findByEventId(id);
  }

  @Get('/status/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Obtener tareas de un evento por ID de evento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tareas de evento obtenidas correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener las tareas de evento.',
  })
  findByStatus(
    @Query('status') status?: string,
  ) {
    return this.eventTaskService.findByStatus(status);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una tarea de evento por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'La tarea de evento ha sido actualizada correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al actualizar la tarea de evento.' })
  update(@Param('id') id: string, @Body() updateEventTaskDto: UpdateEventTaskDto) {
    return this.eventTaskService.update(id, updateEventTaskDto);
  }
}