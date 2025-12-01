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
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { StorehouseMovementService } from '../services';
import { CreateStorehouseMovementDto } from '../dto/create-storehouse-movement.dto';
import { CreateFromStorehouseDto } from '../dto';
import { CreateManualMovementDto } from '../dto';

@Controller('storehouse-movement')
@ApiTags('Storehouse-Movement')
export class StorehouseMovementController {
  constructor(
    private readonly storehouseMovementService: StorehouseMovementService,
  ) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo movimiento de almacén (modo directo con IDs)' })
  @ApiBody({ type: CreateStorehouseMovementDto })
  create(@Body() dto: CreateStorehouseMovementDto) {
    return this.storehouseMovementService.create(dto);
  }

  @Get('by-storehouse-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener asignaciones por storehouse_code (subtask)' })
  @ApiQuery({ name: 'code', required: true })
  getByStorehouseCode(@Query('code') code: string) {
    return this.storehouseMovementService.getAssignationsByStorehouseCode(code);
  }

  @Post('from-storehouse')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear movimientos desde storehouse_code (subtask)' })
  @ApiBody({ type: CreateFromStorehouseDto })
  createFromStorehouse(@Body() dto: CreateFromStorehouseDto) {
    return this.storehouseMovementService.createFromStorehouse(dto);
  }

  @Post('manual')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un movimiento manual por número de serie' })
  @ApiBody({ type: CreateManualMovementDto })
  createManual(@Body() dto: CreateManualMovementDto) {
    return this.storehouseMovementService.createManual(dto);
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener movimientos con paginación y filtros' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'movement_type', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAllPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('code') code?: string,
    @Query('movement_type') movement_type?: string,
    @Query('state') state?: string,
    @Query('sortField', new DefaultValuePipe('createdAt')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return this.storehouseMovementService.findAllPaginated(
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
}
