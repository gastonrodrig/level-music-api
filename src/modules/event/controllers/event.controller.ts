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
    UseGuards,
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
import { UpdateQuotationDto, UpdateStatusEventDto, CreateQuotationDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { SendQuotationReadyMailDto } from 'src/modules/mail/dto';

@Controller('events')
@ApiTags('Events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('quotation')
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
  createQuotation(@Body() dto: CreateQuotationDto) {
    return this.eventService.createQuotation(dto);
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

  @Get('versions/:event_code')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas las versiones de una cotización por event_code con sus asignaciones' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado de versiones encontradas',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cotización no encontrada',
  })
  async getQuotationVersionsWithAssignations(
    @Param('event_code') event_code: string,
  ) {
    return this.eventService.findEventVersionsByCode(event_code);
  }

  @Patch('quotation/:id')
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
  updateQuotation(
    @Param('id') id: string,
    @Body() dto: UpdateQuotationDto, 
  ) {
    return this.eventService.updateQuotation(id, dto);
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

  @Get(':event_id/send-provider-mails')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar órdenes de compra en PDF por correo a los proveedores del evento',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Correos encolados correctamente para envío',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al procesar el envío de correos a proveedores',
  })
  async sendPurchaseOrdersToProviders(
    @Param('event_id') event_id: string,
  ) {
    return this.eventService.sendPurchaseOrdersToProviders(event_id);
  }

  @Get(':worker_id/events')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener eventos asignados a un trabajador con sus subactividades',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Eventos asignados al trabajador encontrados correctamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trabajador no encontrado o sin eventos',
  })
  async getEventsByWorker(
    @Param('worker_id') worker_id: string,
  ) {
    return this.eventService.getEventsForWorker(worker_id);
  }

  @Post(':send-quotation-ready-email')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar correo indicando que la cotización está lista para revisión',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Correo encolado correctamente para envío al cliente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Evento no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al encolar el correo de cotización lista',
  })
  async sendQuotationReadyEmail(
    @Body() dto: SendQuotationReadyMailDto,
  ) {
    return this.eventService.sendQuotationReadyEmail(dto);
  }
}