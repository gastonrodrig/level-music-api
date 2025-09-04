import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { FeaturedEventService } from '../services';
import { Public } from 'src/auth/decorators';
import { CreateFeaturedEventDto, UpdateFeaturedEventDto } from '../dto';

@ApiTags('Featured-Events')
@Controller('featured-events')
export class FeaturedEventController {
  constructor(private readonly featuredEventService: FeaturedEventService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 6 }, 
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear evento destacado (primer archivo = cover, resto = galería)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Evento destacado creado' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event_id: { type: 'string', example: '64f1c7e...' },
        title: { type: 'string', example: 'Festival de Música Electrónica' },
        featured_description: { type: 'string', example: 'Un show con los mejores DJs internacionales' },
        services: {
          type: 'string',
          description: 'JSON string de servicios',
          example: JSON.stringify([
            { title: 'Escenario Principal', description: 'Con sonido y pantallas LED' },
            { title: 'Zona VIP', description: 'Open bar y lounge privado' },
          ]),
        },
        images: { 
          type: 'array', 
          items: { type: 'string', format: 'binary' } 
        }, 
      },
      required: ['event_id', 'title', 'services', 'images'],
    },
  })
  async create(
    @UploadedFiles() files: { images: Express.Multer.File[] },
    @Body() dto: CreateFeaturedEventDto,
  ) {
    return this.featuredEventService.create(dto, files?.images ?? []);
  }

  @Get('all')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los eventos destacados sin paginación (incluye imágenes como en paginado)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista completa de eventos destacados con imágenes compuestas igual que el paginado.' })
  async findAll() {
    return this.featuredEventService.findAll();
  }

  @Get('paginated')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener eventos destacados con paginación, búsqueda y orden',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de eventos destacados obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los eventos destacados paginada.',
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
    @Query('sortField', new DefaultValuePipe('type')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
  ) {
    return this.featuredEventService.findAllPaginated(
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 6 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Actualizar evento destacado (metadata + opcional imágenes: 1ra reemplaza cover, resto se agrega a la galería)',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Evento destacado actualizado' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event_id: { type: 'string', example: '64f1c7e...' },
        title: { type: 'string', example: 'Festival de Música Electrónica (Edición 2025)' },
        featured_description: { type: 'string', example: 'Line-up renovado y nuevas zonas' },
        services: {
          type: 'string',
          description: 'JSON string de servicios',
          example: JSON.stringify([
            { title: 'Nuevo Escenario', description: 'Audio mejorado' },
            { title: 'Zona VIP', description: 'Open bar y lounge privado' },
          ]),
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Opcional. Si envías: images[0] reemplaza cover, el resto se agrega a la galería',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Body() dto: UpdateFeaturedEventDto,
  ) {
    return this.featuredEventService.update(id, dto, files?.images ?? []);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Eliminar un evento destacado (incluye cover, galería y archivos en storage)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Evento destacado eliminado' })
  async remove(@Param('id') id: string) {
    return this.featuredEventService.delete(id);
  }
}
