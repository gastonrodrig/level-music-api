import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators';
import { CreateStorehouseMovementDto } from '../dto';
import { StorehouseMovementService } from '../services/storehouse_movement.service';

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

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los movimientos de almacén' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de movimientos de almacén obtenida correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los movimientos de almacén.',
  })
  findAll() {
    return this.storehouseMovementServices.findAll();
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

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un movimiento de almacén por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El movimiento de almacén ha sido eliminado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al eliminar el movimiento de almacén.',
  })
  remove(@Param('id') id: string) {
    return this.storehouseMovementServices.remove(id);
  }


}
