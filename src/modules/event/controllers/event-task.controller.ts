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
  Patch
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { EventTaskService } from '../services/event-task.service';
import { CreateEventTaskDto, UpdateEventTaskDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { FileFieldsInterceptor } from '@nestjs/platform-express';


@Controller('event-tasks')
@ApiTags('Event-Task')
export class EventTaskController {
  constructor(private readonly eventTaskService: EventTaskService) {}

  @Post()
  // @UseGuards(FirebaseAuthGuard)
  // @ApiBearerAuth('firebase-auth')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear actividad padre y sus subactividades' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La actividad ha sido creada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear la actividad.',
  })
  create(@Body() dto: CreateEventTaskDto) {
    return this.eventTaskService.create(dto);
  }

  @Put(':id')
  // @UseGuards(FirebaseAuthGuard)
  // @ApiBearerAuth('firebase-auth')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar actividad padre y todas sus subactividades' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La actividad ha sido actualizada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar la actividad.',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventTaskDto,
  ) {
    return this.eventTaskService.update(id, dto);
  }

 
  // @Post()
  // @Public()
  // @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ summary: 'Crear una nueva tarea de evento (acepta archivos multipart/form-data)' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       event_id: { type: 'string' },
  //       worker_type_id: { type: 'string' },
  //       worker_id: { type: 'string' },
  //       title: { type: 'string' },
  //       notes: { type: 'string' },
  //       status: { type: 'string' },
  //       phase: { type: 'string' },
  //       requires_evidence: { type: 'boolean' },
  //       event_type_id: { type: 'string' },
  //       // archivos: field 'files' como array de binario
  //       files: {
  //         type: 'array',
  //         items: { type: 'string', format: 'binary' },
  //       },
  //     },
  //     required: ['event_id', 'worker_type_id', 'title'],
  //   },
  // })
  // @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  // create(
  //   @UploadedFiles() files: { files?: Express.Multer.File[] },
  //   @Body() createEventTaskDto: CreateEventTaskDto,
  // ) {
  //   return this.eventTaskService.create(createEventTaskDto, files?.files ?? []);
  // }



  // @Get('/event/:id')
  // @UseGuards(FirebaseAuthGuard)
  // @ApiBearerAuth('firebase-auth')
  // @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ summary: 'Obtener tareas de un evento por ID de evento' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Tareas de evento obtenidas correctamente.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Error al obtener las tareas de evento.',
  // })
  // findByEvent(
  //   @Param('id') id: string,
  // ) {
  //   return this.eventTaskService.findByEventId(id);
  // }

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

  @Patch(':id/worker')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar solo el trabajador asignado a una tarea de evento' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trabajador actualizado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al actualizar el trabajador.' })
  async updateWorker(
    @Param('id') id: string,
    @Body() dto: UpdateEventTaskDto,
  ) {
    return this.eventTaskService.update(id, dto);
  }
}