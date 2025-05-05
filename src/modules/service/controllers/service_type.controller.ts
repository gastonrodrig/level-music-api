import { Controller, Get, Post, Put, Delete, Query, Param, Body, HttpCode, HttpStatus, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';
import { ServiceTypeService } from '../services/service_type.service';
import { CreateServiceTypeDto } from '../dto/create-service_type.dto';
import { UpdateServiceTypeDto } from '../dto/update-service_type.dto';

@ApiTags('Service Types')
@Controller('service-types')
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de servicio' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El tipo de servicio ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el tipo de servicio.',
  })
  async create(@Body() createServiceTypeDto: CreateServiceTypeDto) {
    return this.serviceTypeService.create(createServiceTypeDto);
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los tipos de servicios' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tipos de servicios obtenida correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los tipos de servicios.',
  })
  async findAll() {
    return this.serviceTypeService.findAll();
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tipos de servicios con paginación' })
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
    description: 'Devuelve un objeto con `total` y el array `items` de tipos de servicios paginados.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error en los parámetros de paginación.',
  })
  async findAllPaginated(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.serviceTypeService.findAllPaginated(limit, offset);
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un tipo de servicio por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tipo de servicio encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener el tipo de servicio.',
  })
  async findOne(@Param('id') id: string) {
    return this.serviceTypeService.findOne(id);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un tipo de servicio por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El tipo de servicio ha sido actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el tipo de servicio.',
  })
  async update(@Param('id') id: string, @Body() updateServiceTypeDto: UpdateServiceTypeDto) {
    return this.serviceTypeService.update(id, updateServiceTypeDto);
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un tipo de servicio por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El tipo de servicio ha sido eliminado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al eliminar el tipo de servicio.',
  })
  async remove(@Param('id') id: string) {
    return this.serviceTypeService.remove(id);
  }
}
