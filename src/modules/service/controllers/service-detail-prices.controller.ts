import {
  Controller,
  Get,
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

@ApiTags('Service Details Prices')
@Controller('service-details-prices')
export class ServicesDetailsPricesController {
  constructor(
    private readonly servicesDetailsPricesService: ServicesDetailsPricesService,
  ) {}

  @Get('paginated')
  @ApiBearerAuth('firebase-auth')
  @UseGuards(FirebaseAuthGuard)
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
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder?: 'asc' | 'desc',
    @Query('serviceDetailId') serviceDetailId?: string,
  ) {
    return this.servicesDetailsPricesService.findAllPaginated(
      limit,
      offset,
      sortField,
      sortOrder,
      serviceDetailId,
    );
  }
}
