import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkerService } from '../services/worker.service';
import { CreateWorkerDto, UpdateWorkerDto } from '../dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';

@Controller('worker')
@ApiTags('Worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo trabajador' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El trabajador ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el trabajador.',
  })
  create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.create(createWorkerDto);
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los trabajadores' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de trabajadores obtenida correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los trabajadores.',
  })
  findAll() {
    return this.workerService.findAll();
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un trabajador por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trabajador encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener el trabajador.',
  })
  findOne(@Param('id') id: string) {
    return this.workerService.findOne(id);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un trabajador por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El trabajador ha sido actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el trabajador.',
  })
  update(@Param('id') id: string, @Body() updateWorkerDto: UpdateWorkerDto) {
    return this.workerService.update(id, updateWorkerDto);
  }
}
