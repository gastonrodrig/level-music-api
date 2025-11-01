import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { Public } from 'src/auth/decorators';
import { ServicesDetailsPricesService } from '../services';
import { CreateServicesDetailsPricesDto } from '../dto';

@ApiTags('Service Details Prices')
@Controller('service-details-prices')
export class ServicesDetailsPricesController {
  constructor(
    private readonly servicesDetailsPricesService: ServicesDetailsPricesService,
  ) {}

  // ✅ Crear un nuevo registro de precio
  @Public()
  @Post()
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo precio asociado a un detalle de servicio',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Precio registrado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al registrar el precio.',
  })
  async create(@Body() dto: CreateServicesDetailsPricesDto) {
    return this.servicesDetailsPricesService.create(dto);
  }

  // ✅ Obtener precios por ID de detalle de servicio
  @Public()
  @Get('by-detail/:service_detail_id')
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los precios históricos de un detalle de servicio',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Precios obtenidos correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontraron precios para el detalle indicado.',
  })
  async findByServiceDetailId(@Param('service_detail_id') id: string) {
    return this.servicesDetailsPricesService.findByServiceDetailId(id);
  }

  // ✅ Listado general con paginación
  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar todos los precios con paginación (uso administrativo)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de registros por página',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Desplazamiento (offset)',
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    type: String,
    description: 'Campo por el cual ordenar (por defecto start_date)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Dirección del ordenamiento',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado obtenido correctamente.',
  })
  async findAllPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('sortField', new DefaultValuePipe('start_date')) sortField: string,
    @Query('sortOrder', new DefaultValuePipe('desc'))
    sortOrder: 'asc' | 'desc',
  ) {
    return this.servicesDetailsPricesService.findAllPaginated(
      limit,
      offset,
      sortField,
      sortOrder,
    );
  }
}
