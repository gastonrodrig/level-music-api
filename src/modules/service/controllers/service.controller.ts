import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ServiceService } from '../services';
import { CreateServiceDto, UpdateServiceDto } from '../dto';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { Public } from 'src/auth/decorators';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @UseInterceptors(AnyFilesInterceptor()) // Permite campos tipo photos_1, photos_2, etc.
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear un nuevo servicio con múltiples detalles y fotos' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Servicio creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el servicio.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        provider_id: { type: 'string' },
        service_type_id: { type: 'string' },
        serviceDetails: {
          type: 'string',
          example: JSON.stringify([
            { ref_price: 100, details: { desc: 'Decoración floral' } },
            { ref_price: 200, details: { desc: 'Iluminación ambiental' } },
          ]),
        },
        photos_1: { type: 'string', format: 'binary', description: 'Fotos del detalle 1' },
        photos_2: { type: 'string', format: 'binary', description: 'Fotos del detalle 2' },
      },
      required: ['provider_id', 'service_type_id', 'serviceDetails'],
    },
  })
  async create(
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Body() dto: CreateServiceDto
  ) {
    return this.serviceService.create(dto, photos);
  }

  @Get('all')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los servicios' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista completa de servicios.',
  })
  findAll() {
    return this.serviceService.findAll();
  }

  @Get('paginated')
  @ApiBearerAuth('firebase-auth')
  @UseGuards(FirebaseAuthGuard)
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener servicios con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de servicios obtenida correctamente con paginación.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los servicios paginados.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de items por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Número de registros a omitir' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para filtrar resultados' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo por el cual ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Dirección de ordenamiento' })
  findAllPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('sortField', new DefaultValuePipe('name')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return this.serviceService.findAllPaginated(
      limit,
      offset,
      search?.trim(),
      sortField,
      sortOrder,
    );
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor()) // Permite subir fotos dinámicas tipo photos_1, photos_2...
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar un servicio y sus detalles (con fotos opcionales)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Servicio actualizado correctamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Error al actualizar el servicio.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        serviceDetails: {
          type: 'string',
          description: 'Cadena JSON con el array de detalles a actualizar.',
          example: JSON.stringify([
            { _id: '65f123...', ref_price: 150, detail_number: 1, details: { desc: 'Detalle 1' } },
            { ref_price: 200, detail_number: 2, details: { desc: 'Detalle nuevo' } },
          ]),
        },
        photos_to_delete: {
          type: 'string',
          description: 'Cadena JSON opcional con IDs de fotos a eliminar.',
          example: JSON.stringify(['65fabc...', '65fdef...']),
        },
        photos_1: { type: 'string', format: 'binary', description: 'Fotos nuevas para el detalle 1' },
        photos_2: { type: 'string', format: 'binary', description: 'Fotos nuevas para el detalle 2' },
      },
      required: ['serviceDetails'],
    },
  })
  async updateFullService(
    @Param('id') serviceId: string,
    @UploadedFiles() photos: Array<Express.Multer.File> = [],
    @Body() dto: UpdateServiceDto
  ) {
    return this.serviceService.updateFullService(serviceId, dto, photos);
  }
}
