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
import { ActivityTemplateService } from '../services';
import { CreateActivityTemplateDto, UpdateActivityTemplateDto } from '../dto';

@Controller('activity-templates')
@ApiTags('Activity-Template')
export class ActivityTemplateController {
  constructor(private readonly activityTemplateService: ActivityTemplateService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva plantilla de actividad' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La plantilla de actividad ha sido creada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear la plantilla de actividad.',
  })
  create(@Body() createActivityTemplateDto: CreateActivityTemplateDto) {
    return this.activityTemplateService.create(createActivityTemplateDto);
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener plantillas de actividad con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de plantillas de actividad obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener las plantillas de actividad paginada.',
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
    return this.activityTemplateService.findAllPaginated(
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
  @ApiOperation({ summary: 'Obtener una plantilla de actividad por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plantilla de actividad encontrada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener la plantilla de actividad.',
  })
  findOne(@Param('id') id: string) {
    return this.activityTemplateService.findOne(id);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una plantilla de actividad por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'La plantilla de actividad ha sido actualizada correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al actualizar la plantilla de actividad.' })
  update(@Param('id') id: string, @Body() updateActivityTemplateDto: UpdateActivityTemplateDto) {
    return this.activityTemplateService.update(id, updateActivityTemplateDto);
  }
}