import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkerTypeService } from '../services/worker-type.service';
import { CreateWorkerTypeDto, UpdateWorkerTypeDto } from '../dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';

@Controller('worker-type')
@ApiTags('Worker Type')
export class WorkerTypeController {
  constructor(private readonly workerTypeService: WorkerTypeService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de trabajador' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El tipo de trabajador ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el tipo de trabajador.',
  })
  create(@Body() createWorkerTypeDto: CreateWorkerTypeDto) {
    return this.workerTypeService.create(createWorkerTypeDto);
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Obtener todos los tipos de trabajadores' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lista de tipos de trabajadores obtenida correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los tipos de trabajadores.',
  })
  findAll() {
    return this.workerTypeService.findAll();
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tipos de trabajadores con paginación' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de elementos por página (por defecto 10, máximo configurable en el servicio)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Número de elementos a saltar (por defecto 0)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Devuelve un objeto con `total` y el array `items` de tipos de trabajador paginados.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error en los parámetros de paginación.',
  })
  findAllPaginated(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.workerTypeService.findAllPaginated(limit, offset);
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Obtener un tipo de trabajador por ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tipo de trabajador encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener el tipo de trabajador.',
  })
  findOne(@Param('id') id: string) {
    return this.workerTypeService.findOne(id);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un tipo de trabajador por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El tipo de trabajador ha sido actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el tipo de trabajador.',
  })
  update(
    @Param('id') id: string,
    @Body() updateWorkerTypeDto: UpdateWorkerTypeDto,
  ) {
    return this.workerTypeService.update(id, updateWorkerTypeDto);
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un tipo de trabajador por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El tipo de trabajador ha sido eliminado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al eliminar el tipo de trabajador.',
  })
  remove(@Param('id') id: string) {
    return this.workerTypeService.remove(id);
  }
}
