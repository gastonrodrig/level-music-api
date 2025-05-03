import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ProviderService } from '../services/provider.service';
import { CreateProviderDto } from '../dto/create-provider.dto';
import { UpdateProviderDto } from '../dto/update-provider.dto';
import { Public } from '../../../auth/decorators';

@ApiTags('Providers')
@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El proveedor ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el proveedor.',
  })
  async create(@Body() createProviderDto: CreateProviderDto) {
    return this.providerService.create(createProviderDto);
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de proveedores obtenida correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los proveedores.',
  })
  async findAll() {
    return this.providerService.findAll();
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener proveedores con paginación' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description:
      'Cantidad de elementos por página (por defecto 10, máximo configurable en el servicio)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Número de elementos a saltar (por defecto 0)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Devuelve un objeto con `total` y el array `items` de proveedores paginados.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error en los parámetros de paginación.',
  })
  async findAllPaginated(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.providerService.findAllPaginated(limit, offset);
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proveedor encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener el proveedor.',
  })
  async findOne(@Param('id') id: string) {
    return this.providerService.findOne(id);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un proveedor por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El proveedor ha sido actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el proveedor.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return this.providerService.update(id, updateProviderDto);
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un proveedor por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El proveedor ha sido eliminado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al eliminar el proveedor.',
  })
  async remove(@Param('id') id: string) {
    return this.providerService.remove(id);
  }
}
