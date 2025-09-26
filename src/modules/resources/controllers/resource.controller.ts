import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery, 
  ApiResponse, 
  ApiBearerAuth
} from '@nestjs/swagger';
import { 
  CreateResourceDto, 
  UpdateResourceDto, 
} from '../dto';
import { ResourceService } from '../services';
import { Public } from '../../../auth/decorators';
import { FirebaseAuthGuard } from 'src/auth/guards';

@Controller('resources')
@ApiTags('Resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo recurso' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El recurso ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el recurso.',
  })
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourceService.create(createResourceDto);
  }

  @Get('paginated')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener recurso con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de recursos obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los recursos paginada.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para filtrar' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc','desc'], description: 'Dirección de orden' })
  findAllPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0),  ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('sortField', new DefaultValuePipe('name')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return this.resourceService.findAllPaginated(
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
    );
  }
  
  @Get('by-serial')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener equipo por número de serie' })
  @ApiQuery({ name: 'serial', required: true, type: String, description: 'Número de serie del equipo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Equipo encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Equipo no encontrado.',
  })
  findBySerial(@Query('serial') serial: string) {
    return this.resourceService.findBySerial(serial);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Obtener un recurso por ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recurso encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener el recurso.',
  })
  findOne(@Param('id') id: string) {
    return this.resourceService.findOne(id);
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un recurso por ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'El recurso ha sido actualizado correctamente.' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Error al actualizar el recurso.' 
  })
  update(
    @Param('id') id: string, 
    @Body() updateResourceDto: UpdateResourceDto
  ) {
    return this.resourceService.update(id, updateResourceDto);
  }

  @Get('available-by-date')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener equipos disponibles para una fecha específica' })
  @ApiQuery({ 
    name: 'date', 
    required: true, 
    type: String, 
    description: 'Fecha para verificar disponibilidad (YYYY-MM-DD)' 
  })
  @ApiQuery({ 
    name: 'resourceType', 
    required: false, 
    type: String, 
    description: 'Filtrar por tipo de recurso' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de equipos disponibles para la fecha especificada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los equipos disponibles.',
  })
  getAvailableResourcesByDate(
    @Query('date') date: string,
    @Query('resourceType') resourceType?: string,
  ) {
    return this.resourceService.getAvailableResourcesByDate(date, resourceType);
  }
}
