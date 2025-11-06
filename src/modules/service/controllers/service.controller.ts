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
  BadRequestException,
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
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

@Post()
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('firebase-auth')
@HttpCode(HttpStatus.CREATED)
@UseInterceptors(AnyFilesInterceptor()) // ¡Esto está perfecto!
@ApiConsumes('multipart/form-data') // ¡Esto está perfecto!
@ApiOperation({ summary: 'Crear un nuevo servicio con múltiples detalles y fotos' })
@ApiBody({
  // Tu ApiBody ahora debe reflejar esto
  schema: {
    type: 'object',
    properties: {
      provider_id: { type: 'string' },
      service_type_id: { type: 'string' },
      serviceDetails: {
        type: 'string',
        description: 'Un STRING JSON que contiene el array de serviceDetails.',
        example: '[{"ref_price":100,"detail_number":1,"details":{"desc":"Detalle 1"}}]'
      },
     photos_1: {
        type: 'string',
        format: 'binary',
        description: '(Opcional) Fotos para el detalle con detail_number: 1'
      },
      photos_2: {
        type: 'string',
        format: 'binary',
        description: '(Opcional) Fotos para el detalle con detail_number: 2'
      },
      photos_3: {
        type: 'string',
        format: 'binary',
        description: '(Opcional) Fotos para el detalle con detail_number: 3'
      },
      photos_4: {
        type: 'string',
        format: 'binary',
        description: '(Opcional) Fotos para el detalle con detail_number: 4'
      },
    },
    required: ['provider_id', 'service_type_id', 'serviceDetails']
  },
})
async create(
  // 1. Recibimos el body como 'any' porque NO es un DTO válido aún
  @Body() body: any, 
  @UploadedFiles() photos: Array<Express.Multer.File> = []
) {
  
  // 2. Validamos que los campos de texto esperados existan
  if (!body.provider_id || !body.service_type_id || !body.serviceDetails) {
    throw new BadRequestException('Faltan campos requeridos: provider_id, service_type_id, o serviceDetails.');
  }

  // 3. Construimos el DTO manualmente
  const dto: CreateServiceDto = {
    provider_id: body.provider_id,
    service_type_id: body.service_type_id,
    serviceDetails: [], // Inicializamos
  };

  // 4. ¡LA CLAVE! Parseamos el string 'serviceDetails' de vuelta a un objeto JSON
  try {
    dto.serviceDetails = JSON.parse(body.serviceDetails);

    // Validación extra
    if (!Array.isArray(dto.serviceDetails) || dto.serviceDetails.length === 0) {
      throw new Error('serviceDetails debe ser un array con al menos un detalle.');
    }
  } catch (error) {
    throw new BadRequestException(`El campo "serviceDetails" debe ser un string JSON válido con formato de array. Error: ${error.message}`);
  }

  // 5. Llamamos al servicio con el DTO reconstruido y los archivos
  // Tu servicio ya está listo para manejar esto.
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
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
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
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un servicio y sus detalles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El servicio ha sido actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el servicio.',
  })
  async updateFullService(
    @Param('id') serviceId: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.serviceService.updateFullService(serviceId, dto);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Obtener un servicio por ID con sus detalles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Servicio obtenido correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Servicio no encontrado.',
  })
  async findOneWithDetails(@Param('id') serviceId: string) {
    return this.serviceService.findOneWithDetails(serviceId);
  }
}
