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
  NotFoundException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ResourceService } from '../services/resource.service';
import { CreateResourceDto, UpdateResourceDto } from '../dto';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';

@Controller('resources')
@ApiTags('Resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @Public()
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
    @Public()
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
  @Public()
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
  @Public()
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
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un recurso por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'El recurso ha sido actualizado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al actualizar el recurso.' })
  update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
    return this.resourceService.update(id, updateResourceDto);
  }


}
