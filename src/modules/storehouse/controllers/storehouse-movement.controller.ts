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
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { CreateStorehouseMovementDto } from '../dto';
import { CreateFromEventDto } from '../dto/create-from-event.dto';
import { CreateManualMovementDto } from '../dto/create-manual-movement.dto';
import { ApiBody } from '@nestjs/swagger';
import { StorehouseMovementService } from '../services';

@Controller('storehouse-movement')
@ApiTags('Storehouse-Movement')
export class StorehouseMovementController {
  constructor(
    private readonly storehouseMovementServices: StorehouseMovementService,
  ) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo movimiento de almacén' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El movimiento de almacén ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el movimiento de almacén.',
  })
  create(@Body() createStorehouseMovementDto: CreateStorehouseMovementDto) {
    return this.storehouseMovementServices.create(createStorehouseMovementDto);
  }

  @Get('by-event-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener asignaciones relevantes por event_code (una por equipo) para crear movimientos' })
  getByEventCode(@Query('code') code: string) {
    return this.storehouseMovementServices.getAssignationsByEventCode(code);
  }

  @Get('by-storehouse-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener asignaciones relevantes por storehouse_code (subtask) para crear movimientos' })
  getByStorehouseCode(@Query('code') code: string) {
    return this.storehouseMovementServices.getAssignationsByStorehouseCode(code);
  }

  @Post('from-event')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear movimientos en lote a partir de un event_code (uno por asignación de equipo)' })
  @ApiBody({ type: CreateFromEventDto })
  createFromEvent(@Body() dto: CreateFromEventDto) {
    return this.storehouseMovementServices.createFromEvent(dto);
  }

  @Post('from-storehouse')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear movimientos en lote a partir de un storehouse_code (subtask) (uno por asignación de equipo)' })
  @ApiBody({ type: CreateFromEventDto })
  createFromStorehouse(@Body() dto: CreateFromEventDto) {
    return this.storehouseMovementServices.createFromStorehouse(dto);
  }

  @Post('manual')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear movimiento manual por número de serie' })
  @ApiBody({ type: CreateManualMovementDto })
  createManual(@Body() dto: CreateManualMovementDto) {
    return this.storehouseMovementServices.createManual(dto);
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener movimiento de almacén con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de movimientos de almacén obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los movimientos de almacén paginada.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para filtrar' })
  @ApiQuery({ name: 'code', required: false, type: String, description: 'Filtro por code del movimiento' })
  @ApiQuery({ name: 'movement_type', required: false, type: String, description: 'Filtro por tipo de movimiento' })
  @ApiQuery({ name: 'state', required: false, type: String, description: 'Filtro por estado del movimiento' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc','desc'], description: 'Dirección de orden' })
  findAllPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0),  ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('code') code?: string,
    @Query('movement_type') movement_type?: string,
    @Query('state') state?: string,
    @Query('sortField', new DefaultValuePipe('name')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return this.storehouseMovementServices.findAllPaginated(
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
      code,
      movement_type,
      state,
    );
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un movimiento de almacén por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Movimiento de almacén encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener el movimiento de almacén.',
  })
  findOne(@Param('id') id: string) {
    return this.storehouseMovementServices.findOne(id);
  }
}
