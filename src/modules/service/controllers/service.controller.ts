import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery, 
  ApiResponse, 
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { Public } from '../../../auth/decorators';
import { ServiceService } from '../services';
import { CreateServiceDto, UpdateServiceDto } from '../dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer/interceptors/file-fields.interceptor';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'media', maxCount: 10 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear un nuevo servicio con detalle y multimedia' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        provider_id: { type: 'string', example: '64f1c7e...' },
        service_type_id: { type: 'string', example: '64f1c7e...' },
        details: {
          type: 'string',
          description: 'JSON string de un objeto con los detalles del servicio',
          example: JSON.stringify({
            area_m2: '200',
            color: 'Rojo'
          }),
        },
        ref_price: { type: 'number', example: 1500 },
        media: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['provider_id', 'service_type_id', 'details', 'ref_price', 'media'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El servicio ha sido creado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear el servicio.',
  })
  async create(
    @UploadedFiles() files: { media: Express.Multer.File[] },
    @Body() dto: CreateServiceDto,
  ) {
    return this.serviceService.create(dto, files.media ?? []);
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener servicios con paginación, búsqueda y orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de servicios obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los servicios paginada.',
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

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Servicio encontrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener el servicio.',
  })
  async findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Put(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un servicio por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El servicio ha sido actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al actualizar el servicio.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.serviceService.update(id, updateServiceDto);
  }
}
