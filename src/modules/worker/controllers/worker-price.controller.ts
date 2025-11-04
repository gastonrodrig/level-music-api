import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Get,
  UseGuards,
} from '@nestjs/common';
import { CreateWorkerPriceDto } from '../dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { WorkerPriceService } from '../services';
import { FirebaseAuthGuard } from 'src/auth/guards';
import { Public } from 'src/auth/decorators';

@Controller('worker-prices')
@ApiTags('Worker Prices')
export class WorkerPriceController {
  constructor(private readonly workerPriceService: WorkerPriceService) {}

  @Post('update-reference-price')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar precio de referencia y registrar temporada' })
  @ApiResponse({ status: 200, description: 'Precio actualizado correctamente' })
  async updateReferencePrice(@Body() dto: CreateWorkerPriceDto) {
    return this.workerPriceService.updateReferencePrice(dto);
  }

  @Get('paginated')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener precios del trabajador con paginación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de precios del trabajador obtenida paginada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los precios de los trabajadores paginados.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc','desc'], description: 'Dirección de orden' })
  @ApiQuery({ name: 'worker_id', required: false, type: String, description: 'ID del trabajador' })
  findAllPaginated(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('sortField', new DefaultValuePipe('name')) sortField?: string,
    @Query('sortOrder', new DefaultValuePipe('desc')) sortOrder?: 'asc' | 'desc',
    @Query('worker_id') worker_id?: string,
  ) {
    return this.workerPriceService.findPricesPaginated(
      limit,
      offset,
      sortField,
      sortOrder,
      worker_id,
    );
  }
}
