import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';
import { ServiceService } from '../services/service.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo servicio' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El servicio ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el servicio.',
  })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los servicios' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de servicios obtenida correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los servicios.',
  })
  async findAll() {
    return this.serviceService.findAll();
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener servicios con paginación' })
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
    description: 'Devuelve un objeto con `total` y el array `items` de servicios paginados.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error en los parámetros de paginación.',
  })
  async findAllPaginated(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.serviceService.findAllPaginated(limit, offset);
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Servicio encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener el servicio.',
  })
  async findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un servicio por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El servicio ha sido actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el servicio.',
  })
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un servicio por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El servicio ha sido eliminado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al eliminar el servicio.',
  })
  async remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
