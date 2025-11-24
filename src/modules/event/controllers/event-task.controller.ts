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
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Patch
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { EventTaskService } from '../services/event-task.service';
import { CreateMultipleTasksDto, UpdateMultipleTasksDto, UpdateSubtaskDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EventSubtaskService } from '../services';

@Controller('event-tasks')
@ApiTags('Event-Task')
export class EventTaskController {
  constructor(private readonly eventTaskService: EventTaskService, private readonly subtaskService: EventSubtaskService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear múltiples actividades padre y sus subactividades' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Las actividades han sido creadas correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear las actividades.',
  })
  create(@Body() dto: CreateMultipleTasksDto) {
    return this.eventTaskService.createMany(dto);
  }

  @Put('bulk')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar múltiples actividades padre y sus subactividades' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Las actividades han sido actualizadas correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar las actividades.',
  })
  updateMany(
    @Body() dto: UpdateMultipleTasksDto,
  ) {
    return this.eventTaskService.updateMany(dto);
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

  @Patch(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar subtask (status, notas, evidencias)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['Pendiente', 'En Progreso', 'Completado'] },
        notas: { type: 'string' },
        worker_id: { type: 'string' },
        evidences: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('evidences', 10))
  async update(
    @Param('id') id: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const workerId = updateSubtaskDto.worker_id;

    return this.subtaskService.updateSubtask(
      id, 
      updateSubtaskDto, 
      files, 
      workerId
    );
  }

}