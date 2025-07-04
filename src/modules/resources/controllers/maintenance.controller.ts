import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Patch,
} from '@nestjs/common';
import { 
  ApiOperation, 
  ApiQuery, 
  ApiResponse, 
  ApiTags,
} from '@nestjs/swagger';
import { 
  CreateMaintenanceDto, 
  UpdateMaintenanceStatusDto 
} from '../dto';
import { MaintenanceService } from '../services';
import { Public } from 'src/auth/decorators';

@Controller('maintenance')
@ApiTags('Maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceServices: MaintenanceService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo mantenimiento' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El mantenimiento ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el mantenimiento.',
  })
  create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceServices.create(createMaintenanceDto);
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener mantenimiento con paginación, búsqueda y orden',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de mantenimientos obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los mantenimientos paginada.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items por página',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Texto para filtrar',
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    type: String,
    description: 'Campo para ordenar',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Dirección de orden',
  })
  findAllPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('sortField', new DefaultValuePipe('name')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return this.maintenanceServices.findAllPaginated(
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
    );
  }

  @Patch(':id/status')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar estado del mantenimiento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'El estado del mantenimiento ha sido actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el estado del mantenimiento.',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateMaintenanceStatusDto,
  ) {
    return this.maintenanceServices.updateStatus(id, statusDto);
  }
}
