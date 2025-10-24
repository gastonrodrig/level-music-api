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
    Req,
    Patch,
 } from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiQuery, 
  ApiResponse, 
  ApiTags 
} from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';
import { EventService } from '../services';
import { UpdateStatusEventDto, CreateEventDto, UpdateEventDto, UpdateEventWithResourcesDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { CreateQuotationLandingDto, CreateQuotationAdminDto } from '../dto';

@Controller('events')
@ApiTags('Events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
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

  @Post('quotation/landing')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Solicitar una cotización para un evento' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cotización creada correctamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear la cotización',
  })
  createQuotation(@Body() dto: CreateQuotationLandingDto) {
    return this.eventService.createQuotationLanding(dto);
  }

  @Post('quotation/admin')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear cotización de evento por admin (con asignaciones)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cotización de evento creada correctamente por admin',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear la cotización por admin',
  })
  createQuotationAdmin(@Body() dto: CreateQuotationAdminDto) {
    return this.eventService.createQuotationAdmin(dto);
  }

  @Get('paginated')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las cotizaciones (eventos) con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cotizaciones encontradas correctamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cotizaciones no encontradas',
  })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'ID del usuario' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para filtrar' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc','desc'], description: 'Dirección de orden' })
  @ApiQuery({ name: 'case', required: false, type: Number, description: 'Número de caso opcional para filtrar por conjunto de estados' })
  findAllQuotationsPaginated(
    @Query('user_id') user_id?: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Query('search') search?: string,
    @Query('sortField', new DefaultValuePipe('created_at')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
    @Query('case') caseFilterRaw?: string,
  ) {
    return this.eventService.findAllQuotationsPaginated(
      user_id,
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
      Number(caseFilterRaw),
    );
  }

  @Patch('quotation/admin/:id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar cotización de evento por admin (con asignaciones)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cotización de evento actualizada correctamente por admin',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar la cotización por admin',
  })
  updateQuotationAdmin(
    @Param('id') id: string,
    @Body() dto: CreateQuotationAdminDto, 
  ) {
    return this.eventService.updateQuotationAdmin(id, dto);
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
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

  @Patch(':id/with-resources')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar info del evento y asignar recursos en una sola operación',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Evento actualizado y recursos asignados correctamente',
    type: Event,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar evento o asignar recursos',
  })
  updateEventWithResources(
    @Param('id') id: string,
    @Body() dto: UpdateEventWithResourcesDto,
  ) {
    return this.eventService.assignResources(id, dto);
  }

  @Get('status-payment')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiQuery({ name: 'status', required: true, type: String, description: 'Estado del evento (En Seguimiento, Reprogramado, Finalizado)' })
  @ApiOperation({ summary: 'Listar eventos por estado de seguimiento' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Eventos filtrados por estado de seguimiento' })
  findByTrackingStatus(@Query('status') status: string) {
    return this.eventService.findByPaymentStatus(status);
}

  @Patch(':event_id/status')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar estado del evento',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del evento actualizado correctamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el estado del evento',
  })
  async updateEventStatus(
    @Param('event_id') event_id: string,
    @Body() dto: UpdateStatusEventDto,
  ) {
    return this.eventService.updateStatus(event_id, dto);
  }

  @Get(':id')
    @UseGuards(FirebaseAuthGuard)
    @ApiBearerAuth('firebase-auth')
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
  
}