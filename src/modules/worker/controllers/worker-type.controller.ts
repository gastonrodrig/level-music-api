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
  DefaultValuePipe,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { WorkerTypeService } from '../services/worker-type.service';
import { CreateWorkerTypeDto, UpdateWorkerTypeDto } from '../dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';

@Controller('worker-type')
@ApiTags('Worker Type')
export class WorkerTypeController {
  constructor(private readonly workerTypeService: WorkerTypeService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de trabajador' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El tipo de trabajador ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el tipo de trabajador.',
  })
  create(@Body() createWorkerTypeDto: CreateWorkerTypeDto) {
    return this.workerTypeService.create(createWorkerTypeDto);
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tipos de trabajadores con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tipos de trabajadores obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los tipos de trabajadores paginada.',
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
    return this.workerTypeService.findAllPaginated(
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
  @ApiOperation({ summary: 'Obtener un tipo de trabajador por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tipo de trabajador encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener el tipo de trabajador.',
  })
  findOne(@Param('id') id: string) {
    return this.workerTypeService.findOne(id);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un tipo de trabajador por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El tipo de trabajador ha sido actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el tipo de trabajador.',
  })
  update(
    @Param('id') id: string,
    @Body() updateWorkerTypeDto: UpdateWorkerTypeDto,
  ) {
    return this.workerTypeService.update(id, updateWorkerTypeDto);
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un tipo de trabajador por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El tipo de trabajador ha sido eliminado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al eliminar el tipo de trabajador.',
  })
  remove(@Param('id') id: string) {
    return this.workerTypeService.remove(id);
  }
}
