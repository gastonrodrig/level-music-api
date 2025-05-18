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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { EventTaskService } from '../services/event-task.service';
import { CreateEventTaskDto, UpdateEventTaskDto } from '../dto';

@Controller('event-tasks')
@ApiTags('Event-Task')
export class EventTaskController {
  constructor(private readonly eventTaskService: EventTaskService) {}

  @Post()
  @Public()
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

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tareas de evento con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tareas de evento obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener las tareas de evento paginada.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para filtrar' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc','desc'], description: 'Dirección de orden' })
  findAllPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('sortField', new DefaultValuePipe('name')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return this.eventTaskService.findAllPaginated(
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
    );
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