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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { EventTaskService } from '../services/event-task.service';
import { CreateEventTaskDto, UpdateEventTaskDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { get } from 'mongoose';

@Controller('event-tasks')
@ApiTags('Event-Task')
export class EventTaskController {
  constructor(private readonly eventTaskService: EventTaskService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva tarea de evento' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La tarea de evento ha sido creada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear la tarea de evento.',
  })
  create(@Body() createEventTaskDto: CreateEventTaskDto) {
    return this.eventTaskService.create(createEventTaskDto);
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