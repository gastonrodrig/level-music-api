import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    HttpCode,
    HttpStatus,
    DefaultValuePipe,
    Query,
    ParseIntPipe,
    Put,
    UseGuards,
 } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';
import { EventService } from '../services';
import { CreateEventDto, UpdateEventDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';

@Controller('events')
@ApiTags('Events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo evento' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Evento creado correctamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el evento',
  })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener eventos con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de eventos obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los eventos paginada.',
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
    return this.eventService.findAllPaginated(
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
    );
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Obtener un evento por ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Evento encontrado correctamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Evento no encontrado',
  })
  findOne(@Param('id') event_id: string) {
    return this.eventService.findOne(event_id);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un evento por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'El evento ha sido actualizado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al actualizar el evento.' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Get('code/:event_code')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un evento por su código' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Evento encontrado correctamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Evento no encontrado',
  })
  findByCode(@Param('event_code') event_code: string) {
    return this.eventService.findByCode(event_code);
  }
  
  @Get('user/:user_id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener los eventos por usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Eventos encontrados correctamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Eventos no encontrados',
  })
  findByUser(@Param('user_id') user_id: string) {
    return this.eventService.findByUser(user_id);
  }
}