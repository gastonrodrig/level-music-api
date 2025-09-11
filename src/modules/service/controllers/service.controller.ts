import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';
import { ServiceService } from '../services';
import { CreateServiceDto, UpdateServiceDto } from '../dto';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  /**
   * Crear un nuevo servicio con múltiples detalles
   */
  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo servicio con múltiples detalles' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El servicio ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el servicio.',
  })
  async create(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }

  /**
   * Obtener todos los servicios con sus detalles
   */
  @Get('all')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los servicios con sus detalles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista completa de servicios con sus detalles.',
  })
  async findAllWithDetails() {
    return this.serviceService.findAll();
  }

  /**
   * Obtener servicios con paginación, búsqueda y orden
   */
  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener servicios con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de servicios obtenida correctamente con paginación.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los servicios paginados.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de items por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Número de registros a omitir' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para filtrar resultados' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo por el cual ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Dirección de ordenamiento' })
  findAllPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('sortField', new DefaultValuePipe('name')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return this.serviceService.findAllPaginated(
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
    );
  }

  @Patch(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un servicio y sus detalles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El servicio ha sido actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el servicio.',
  })
  async updateFullService(
    @Param('id') serviceId: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.serviceService.updateFullService(serviceId, dto);
  }
}
